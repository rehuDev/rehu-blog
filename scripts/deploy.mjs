import { cp, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import process from 'node:process';
import { spawn } from 'node:child_process';

const rootDir = process.cwd();
const deployEnvCandidates = [
  path.join(rootDir, '.env.deploy.local'),
  path.join(rootDir, '.env.deploy'),
];
const deployTemplateDir = path.join(rootDir, 'deploy');
const tempPrefix = path.join(os.tmpdir(), 'rehu-blog-deploy-');
const astroCommand =
  process.platform === 'win32'
    ? path.join(rootDir, 'node_modules', '.bin', 'astro.cmd')
    : path.join(rootDir, 'node_modules', '.bin', 'astro');

function parseEnvFile(content) {
  const entries = {};

  for (const rawLine of content.split(/\r?\n/u)) {
    const line = rawLine.trim();
    if (!line || line.startsWith('#')) continue;

    const separatorIndex = line.indexOf('=');
    if (separatorIndex === -1) continue;

    const key = line.slice(0, separatorIndex).trim();
    let value = line.slice(separatorIndex + 1).trim();

    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }

    entries[key] = value;
  }

  return entries;
}

async function loadDeployConfig() {
  let fileConfig = {};

  for (const candidatePath of deployEnvCandidates) {
    try {
      const envContent = await readFile(candidatePath, 'utf8');
      fileConfig = parseEnvFile(envContent);
      break;
    } catch (error) {
      if (error && error.code !== 'ENOENT') {
        throw error;
      }
    }
  }

  const config = {
    host: process.env.DEPLOY_HOST ?? fileConfig.DEPLOY_HOST,
    user: process.env.DEPLOY_USER ?? fileConfig.DEPLOY_USER,
    port: process.env.DEPLOY_PORT ?? fileConfig.DEPLOY_PORT ?? '22',
    remotePath: process.env.DEPLOY_REMOTE_PATH ?? fileConfig.DEPLOY_REMOTE_PATH,
    bindPort:
      process.env.DEPLOY_BIND_PORT ?? fileConfig.DEPLOY_BIND_PORT ?? '8080',
  };

  const missing = Object.entries(config)
    .filter(([key, value]) => !value && key !== 'bindPort')
    .map(([key]) => key);

  if (missing.length > 0) {
    throw new Error(
      `Missing deploy config: ${missing.join(', ')}. Fill out .env.deploy.local or .env.deploy first.`,
    );
  }

  return config;
}

function runCommand(command, args, options = {}) {
  const env = options.env
    ? Object.fromEntries(
        Object.entries(options.env).filter(([, value]) => value !== undefined),
      )
    : undefined;

  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      cwd: rootDir,
      stdio: 'inherit',
      shell:
        process.platform === 'win32' &&
        (command.toLowerCase().endsWith('.cmd') ||
          command.toLowerCase().endsWith('.bat')),
      env,
      ...options,
    });

    child.on('error', reject);
    child.on('close', (code) => {
      if (code === 0) {
        resolve();
        return;
      }

      reject(
        new Error(
          `Command failed: ${command} ${args.join(' ')} (exit code ${code})`,
        ),
      );
    });
  });
}

function createRemoteTarget(config) {
  return `${config.user}@${config.host}`;
}

function createSshArgs(config, remoteCommand) {
  return ['-p', config.port, createRemoteTarget(config), remoteCommand];
}

function createScpArgs(config, source, target) {
  return ['-P', config.port, '-r', source, `${createRemoteTarget(config)}:${target}`];
}

async function prepareBundle(config) {
  const tempDir = await mkdtemp(tempPrefix);
  const tempSiteDir = path.join(tempDir, 'site');
  const tempNginxDir = path.join(tempDir, 'nginx');

  await cp(path.join(rootDir, 'dist'), tempSiteDir, { recursive: true });
  await cp(path.join(deployTemplateDir, 'nginx'), tempNginxDir, { recursive: true });
  await cp(
    path.join(deployTemplateDir, 'docker-compose.yml'),
    path.join(tempDir, 'docker-compose.yml'),
  );
  await cp(
    path.join(deployTemplateDir, 'Dockerfile'),
    path.join(tempDir, 'Dockerfile'),
  );
  await writeFile(
    path.join(tempDir, '.env'),
    `DEPLOY_BIND_PORT=${config.bindPort}\n`,
    'utf8',
  );

  return tempDir;
}

async function main() {
  const config = await loadDeployConfig();

  console.log('\n[1/4] Cleaning dist folder and building Astro site...');

  await rm(path.join(rootDir, 'dist'), { recursive: true, force: true });

  await runCommand(astroCommand, ['build'], {
    env: {
      ...process.env,
      ASTRO_TELEMETRY_DISABLED: '1',
    },
  });

  console.log('\n[2/4] Preparing deployment bundle...');
  const tempDir = await prepareBundle(config);

  const remotePath = config.remotePath.replace(/\\/gu, '/');
  const remotePrepCommand = [
    `mkdir -p '${remotePath}'`,
    `rm -rf '${remotePath}/site' '${remotePath}/nginx'`,
    `mkdir -p '${remotePath}/site' '${remotePath}/nginx'`,
  ].join(' && ');

  try {
    console.log('\n[3/4] Uploading files to server...');
    await runCommand('ssh', createSshArgs(config, remotePrepCommand));
    await runCommand(
      'scp',
      createScpArgs(config, 'site', `${remotePath}/`),
      { cwd: tempDir },
    );
    await runCommand(
      'scp',
      createScpArgs(config, 'nginx', `${remotePath}/`),
      { cwd: tempDir },
    );
    await runCommand(
      'scp',
      createScpArgs(config, 'docker-compose.yml', `${remotePath}/docker-compose.yml`),
      { cwd: tempDir },
    );
    await runCommand(
      'scp',
      createScpArgs(config, 'Dockerfile', `${remotePath}/Dockerfile`),
      { cwd: tempDir },
    );
    await runCommand(
      'scp',
      createScpArgs(config, '.env', `${remotePath}/.env`),
      { cwd: tempDir },
    );
    await runCommand(
      'ssh',
      createSshArgs(
        config,
        `chmod -R a+rX '${remotePath}/site' '${remotePath}/nginx'`,
      ),
    );

    console.log('\n[4/4] Restarting container on server...');
    await runCommand(
      'ssh',
      createSshArgs(
        config,
        `cd '${remotePath}' && docker compose up -d --build --force-recreate --remove-orphans`,
      ),
    );
  } finally {
    await rm(tempDir, { recursive: true, force: true });
  }

  console.log(
    `\nDeploy complete. Your server should now serve the site on port ${config.bindPort}.`,
  );
}

main().catch((error) => {
  console.error(`\nDeploy failed: ${error.message}`);
  process.exitCode = 1;
});
