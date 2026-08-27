import { spawn } from 'node:child_process';
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync, cpSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, posix, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = resolve(__dirname, '..');
const deployEnvPath = join(rootDir, '.env.deploy');
const distDir = join(rootDir, 'dist');
const deployDir = join(rootDir, 'deploy');
const packageName = JSON.parse(readFileSync(join(rootDir, 'package.json'), 'utf8')).name;

const args = new Set(process.argv.slice(2));
const skipBuild = args.has('--skip-build');
const dryRun = args.has('--dry-run');

const requiredEnv = ['DEPLOY_HOST', 'DEPLOY_USER', 'DEPLOY_PORT', 'DEPLOY_REMOTE_PATH', 'DEPLOY_BIND_PORT'];

function loadEnvFile(filePath) {
  if (!existsSync(filePath)) {
    throw new Error(`Missing deploy environment file: ${filePath}`);
  }

  const env = {};
  const lines = readFileSync(filePath, 'utf8').split(/\r?\n/);

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;

    const separatorIndex = trimmed.indexOf('=');
    if (separatorIndex === -1) continue;

    const key = trimmed.slice(0, separatorIndex).trim();
    let value = trimmed.slice(separatorIndex + 1).trim();

    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }

    env[key] = value;
  }

  return env;
}

function requireEnv(env) {
  const missing = requiredEnv.filter((key) => !env[key]);
  if (missing.length > 0) {
    throw new Error(`Missing deploy settings in .env.deploy: ${missing.join(', ')}`);
  }

  if (
    !/^\d+$/.test(env.DEPLOY_PORT) ||
    Number(env.DEPLOY_PORT) < 1 ||
    Number(env.DEPLOY_PORT) > 65535
  ) {
    throw new Error('DEPLOY_PORT must be a port number between 1 and 65535.');
  }

  if (
    !/^\d+$/.test(env.DEPLOY_BIND_PORT) ||
    Number(env.DEPLOY_BIND_PORT) < 1 ||
    Number(env.DEPLOY_BIND_PORT) > 65535
  ) {
    throw new Error('DEPLOY_BIND_PORT must be a port number between 1 and 65535.');
  }

  if (!/^[a-zA-Z0-9._-]+$/.test(env.DEPLOY_USER)) {
    throw new Error('DEPLOY_USER contains unsupported characters.');
  }

  if (!/^[a-zA-Z0-9.:[\]-]+$/.test(env.DEPLOY_HOST) || env.DEPLOY_HOST.startsWith('-')) {
    throw new Error('DEPLOY_HOST contains unsupported characters.');
  }

  const remotePath = env.DEPLOY_REMOTE_PATH;
  const pathParts = remotePath.split('/').filter(Boolean);
  if (
    !remotePath.startsWith('/') ||
    !/^[a-zA-Z0-9._/-]+$/.test(remotePath) ||
    posix.normalize(remotePath) !== remotePath ||
    pathParts.length < 3 ||
    posix.basename(remotePath) !== packageName
  ) {
    throw new Error(
      `DEPLOY_REMOTE_PATH must be a normalized absolute path ending in /${packageName} with at least three path segments.`,
    );
  }

  env.DEPLOY_HEALTH_URL ||= `http://${env.DEPLOY_HOST}:${env.DEPLOY_BIND_PORT}/`;
  const healthUrl = new URL(env.DEPLOY_HEALTH_URL);
  if (!['http:', 'https:'].includes(healthUrl.protocol)) {
    throw new Error('DEPLOY_HEALTH_URL must use http or https.');
  }
}

function shQuote(value) {
  return `'${String(value).replaceAll("'", "'\"'\"'")}'`;
}

function run(command, commandArgs, options = {}) {
  const printable = [command, ...commandArgs].join(' ');
  console.log(`\n> ${printable}`);

  if (dryRun) return Promise.resolve();

  return new Promise((resolveRun, rejectRun) => {
    const child = spawn(command, commandArgs, {
      cwd: rootDir,
      env: process.env,
      stdio: 'inherit',
      windowsHide: true,
      ...options,
    });

    child.on('error', rejectRun);
    child.on('exit', (code) => {
      if (code === 0) {
        resolveRun();
      } else {
        rejectRun(new Error(`${command} exited with code ${code}`));
      }
    });
  });
}

async function runBuild() {
  const runOptions = {
    env: {
      ...process.env,
      ASTRO_TELEMETRY_DISABLED: '1',
    },
  };

  if (process.env.npm_execpath && existsSync(process.env.npm_execpath)) {
    await run(process.execPath, [process.env.npm_execpath, 'run', 'build'], runOptions);
    return;
  }

  await run(process.platform === 'win32' ? 'npm.cmd' : 'npm', ['run', 'build'], {
    ...runOptions,
    shell: process.platform === 'win32',
  });
}

async function verifyHealth(url, attempts = 10) {
  let lastError;

  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    try {
      const response = await fetch(url, { signal: AbortSignal.timeout(5000) });
      await response.body?.cancel();

      if (response.ok) {
        console.log(`\nHealth check passed: ${url} (${response.status})`);
        return;
      }

      lastError = new Error(`HTTP ${response.status}`);
    } catch (error) {
      lastError = error;
    }

    if (attempt < attempts) {
      console.log(`Health check ${attempt}/${attempts} failed; retrying...`);
      await new Promise((resolveDelay) => setTimeout(resolveDelay, 1500));
    }
  }

  throw new Error(`Health check failed for ${url}: ${lastError?.message ?? 'unknown error'}`);
}

function makeStagingDirectory(env) {
  const stagingDir = mkdtempSync(join(tmpdir(), 'rehu-blog-deploy-'));

  mkdirSync(join(stagingDir, 'nginx'), { recursive: true });
  mkdirSync(join(stagingDir, 'site'), { recursive: true });

  cpSync(join(deployDir, 'Dockerfile'), join(stagingDir, 'Dockerfile'));
  cpSync(join(deployDir, 'docker-compose.yml'), join(stagingDir, 'docker-compose.yml'));
  cpSync(join(deployDir, 'nginx'), join(stagingDir, 'nginx'), { recursive: true });
  cpSync(distDir, join(stagingDir, 'site'), { recursive: true });

  writeFileSync(join(stagingDir, '.env'), `DEPLOY_BIND_PORT=${env.DEPLOY_BIND_PORT}\n`);

  return stagingDir;
}

async function main() {
  const env = loadEnvFile(deployEnvPath);
  requireEnv(env);

  if (!existsSync(join(deployDir, 'Dockerfile'))) {
    throw new Error('Missing deploy/Dockerfile.');
  }

  if (!existsSync(join(deployDir, 'docker-compose.yml'))) {
    throw new Error('Missing deploy/docker-compose.yml.');
  }

  if (!existsSync(join(deployDir, 'nginx', 'default.conf'))) {
    throw new Error('Missing deploy/nginx/default.conf.');
  }

  if (!skipBuild) {
    await runBuild();
  }

  if (!existsSync(join(distDir, 'index.html'))) {
    throw new Error('Build output is missing dist/index.html.');
  }

  const stagingDir = makeStagingDirectory(env);
  const archivePath = join(tmpdir(), `rehu-blog-deploy-${Date.now()}.tgz`);
  const remoteArchivePath = `${env.DEPLOY_REMOTE_PATH}/.deploy-upload-${Date.now()}.tgz`;
  const remote = `${env.DEPLOY_USER}@${env.DEPLOY_HOST}`;
  const sshArgs = ['-p', env.DEPLOY_PORT, remote];

  try {
    await run('tar', ['-czf', archivePath, '-C', stagingDir, '.']);

    const prepareRemote = [
      'set -eu',
      `mkdir -p ${shQuote(env.DEPLOY_REMOTE_PATH)}`,
      `test -w ${shQuote(env.DEPLOY_REMOTE_PATH)}`,
    ].join('; ');

    await run('ssh', [...sshArgs, prepareRemote]);
    await run('scp', ['-P', env.DEPLOY_PORT, archivePath, `${remote}:${remoteArchivePath}`]);

    const publishRemote = [
      'set -eu',
      `cd ${shQuote(env.DEPLOY_REMOTE_PATH)}`,
      `test "$(pwd -P)" = ${shQuote(env.DEPLOY_REMOTE_PATH)}`,
      'rm -rf .incoming',
      'mkdir .incoming',
      `tar -xzf ${shQuote(remoteArchivePath)} -C .incoming`,
      `rm -f ${shQuote(remoteArchivePath)}`,
      'test -f .incoming/Dockerfile',
      'test -f .incoming/docker-compose.yml',
      'test -d .incoming/nginx',
      'test -f .incoming/site/index.html',
      'rm -rf site nginx',
      'mv .incoming/site site',
      'mv .incoming/nginx nginx',
      'mv .incoming/Dockerfile Dockerfile',
      'mv .incoming/docker-compose.yml docker-compose.yml',
      'mv .incoming/.env .env',
      'rmdir .incoming',
      'docker compose up -d --build --force-recreate --remove-orphans',
      'docker compose ps',
    ].join('; ');

    await run('ssh', [...sshArgs, publishRemote]);
    if (!dryRun) {
      await verifyHealth(env.DEPLOY_HEALTH_URL);
    }
    console.log(dryRun ? '\nDry run complete.' : '\nDeploy complete.');
  } finally {
    rmSync(stagingDir, { recursive: true, force: true });
    rmSync(archivePath, { force: true });
  }
}

main().catch((error) => {
  console.error(`\nDeploy failed: ${error.message}`);
  process.exitCode = 1;
});
