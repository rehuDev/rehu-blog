---
title: "ブログを作ってみよう"
description: "自分だけの小さなブログを作る"
image: "../../assets/imgs/chip log.avif"
pubDate: 2026-08-26T02:35
updDate: 2026-08-28T21:05
categories:
  - "dev"
mcategories:
  - "Astro"
  - "ウェブ開発"
  - "ブログ"
---

![船の速度を測るために使われたチップログ](<../../assets/imgs/chip log.avif>)

17世紀の船乗りたちは、船尾に木片をつないで船の速さを測っていた。木片と船を結ぶロープには一定の間隔で結び目がつけられており、それを海へ投げ込むと、船が進むにつれて速度に応じた数の結び目が繰り出されていった。これが、今なお航空や航海の分野で使われている速度の単位、ノット（Knot：結び目）の由来である。船速のデータは航海日誌（Logbook）に日々、体系的に記録され、やがて丸太を意味するLogという言葉は「記録」という意味まで持つようになった。 [^1] [^2]

20世紀末の1990年代、個人がインターネット上に記録を残す時代が始まった。WebにLogを記すという意味のWeblog……その短縮形こそが「Blog」である。1999年に設立され、2003年にGoogleに買収されたブログサービス「Blogger」の普及により、今ではブログを知らない人のほうが珍しくなった。 [^3]

しかし、Bloggerのように企業が提供するブログサービスは、私の好みには合わなかった。使う分には便利だったが、何かと制約が多かった。他社のブログも同じだった。そんな不満を抱えたまま時は流れ、やがて誰もがコーディングできるAIの時代がやってきた。

だから、作ることにした。インターネットという果てしない海を、ふわりふわりと漂う、自分だけの小さな舟。私の人生の軌跡を余すところなく記した、私だけの航海日誌。それが、私のBlogになるのだ。

2026-08-26、眠れぬ明け方に。

## Made by Astro (v0.0)

ウェブサイトがどのような仕組みで動いているのかは大まかに知っているものの、プログラミングの知識も、問題を解決する力もまるでない。AIと一緒に、まずは手探りで作りながら、その都度学んでいくつもりである。

少し調べた末、「Astro」というウェブフレームワークで作ることにした。最も人気のあるWordPressを選ばなかったのは、ひとえに私のひねくれた性分のせいである。[[Cloudflare]]に買収されたという話もあり、今後にも期待が持てそうだ。


### 開発環境の構築

執筆時点でAstroのバージョンは7.2であり、インストール方法は[公式サイト](https://astro.build/)と[公式ドキュメント](https://docs.astro.build/)で確認できる。質問に利用できる[公式Discord](https://astro.build/chat)も運営されている。

開発に必要なものは、最新の偶数バージョンの[Node.js](https://nodejs.org)、コードエディター（万能IDEである[[VS code|VS Code]]を推奨）、そしてターミナルである。

```sh
npm create astro@latest
```

OSに付属するターミナルからインストールウィザードを実行する。このとき、プロジェクトフォルダーを作成したい場所で実行する。

```sh
# [dir] Where should we create your new project?（パスとフォルダー名）
rehu-blog
# [tmpl] How would you like to start your new project?（初期テンプレート）
Use minimal (empty) template
# [deps] Install dependencies? (recommended)（依存関係をインストールするか）
Yes
# [git] Initialize a new git repository? (optional)（Gitを使用するか）
Yes
```

インストールウィザードの質問に答え終わると、プロジェクトフォルダーが作成される。これでフォルダーをコードエディター（VS Code）から開いて作業できる。以後はVS Codeの内蔵ターミナルで代用できるため、OSのターミナルは必要ない。

![[blog project; Astro VSCode extension.avif]]

VS Codeの[Astro公式拡張機能](https://marketplace.visualstudio.com/items?itemName=astro-build.astro-vscode)をインストールすれば、開発環境の準備は完了である。

> [!tip] VS Code Tips
> 1. 内蔵ブラウザーを右側に表示（Split right）しておけば、開発サーバーの様子をリアルタイムで確認できる。
> 2. Setting > IndentationでTab sizeを「スペース2個」に設定すると読みやすくなる。

### GitHubリポジトリの設定

代表的なオンラインバージョン管理サービスである[[GitHub]]を使って、バージョン管理（Source Control）というものを始めてみよう。GitHubはVS Codeと連携できるため、複雑なCLIコマンドを使わずに手軽に利用できる。

1. [github.com](https://github.com/new)で新しいリポジトリ（Repository）を作成する。リポジトリ名だけを決め、ほかの初期設定には手を加えなかった。
2. VS Codeのソース管理（Source Control）タブへ移動する。
3. コミットメッセージ欄の上にある•••（三点リーダー）ボタンを押し、`Remote > Add Remote`を選んで自分のアカウントを連携する。続いて、先ほど作成したリポジトリを選択して接続する（remote name: origin）。
4. これでコミットメッセージを入力し、ボタンを押せばコミットできる。
5. GitHubのページに戻ってリポジトリを確認すると、変更内容がきちんとアップロードされている。

今後は変更が生じるたびにGitHubへコミット（Commit）し、バックアップを残しておく。コミットメッセージにはバージョンを記載する。

- なお、コミットの前にはステージングという段階がある。コミットに含めるファイルを自分で確認し、承認する工程である。Source Controlタブで`+`アイコンを押すと、ファイルを個別にステージングできる。
- コミット後はPullとPushまで行って、はじめて外部サーバー（GitHub）へアップロードされる。`Sync Changes`ボタンを押せば自動で処理される。Pullは、リモートリポジトリにほかの人がアップロードした内容があれば先に取得する操作であり、Pushは自分が作成したばかりのコミットをアップロードする操作である。

### デバッグ

```sh
# Astroの開発サーバーを起動
npm run dev
```

VS Codeの内蔵ターミナルから**開発サーバー**を起動する。コマンドを入力すると、ローカルサーバーのアドレス（`http://localhost:4321`）へアクセスできるようになる。開発サーバーは<kbd>Ctrl + C</kbd>で終了する。

ビルドやデプロイと異なるのは、`src/`ディレクトリへの変更がリアルタイムで反映される点である。また、Astro dev toolbarも利用できる。

VS Codeには内蔵ブラウザーもあり、変更内容をすぐに確認できる。ChromeやFirefoxなどのブラウザーでも、<kbd>Ctrl Shift I</kbd>で開発者ツールを開けば、より詳しく調べられる。

### ビルドとデプロイ

私のブログはNetlifyやAWSのようなクラウドサービスを使わず、自分で構築したサーバーコンピューターを利用するため、デプロイの工程は少し複雑になる。

```sh
npm run build
```

まずビルドコマンドを入力すると、`dist/`フォルダーが作成される（*distribution：配布、分配*）。このフォルダーの中身をサーバーコンピューターへアップロードすれば、デプロイは完了である。

しかし、記事を書くたびにビルド済みのファイルを自分でサーバーコンピューターへ移すのは面倒である。そこで、`dist/`フォルダーのファイルをサーバーコンピューターへ転送するスクリプトを作る。

その前に、必要な設定を済ませよう。まずはサーバーコンピューター（Ubuntu VM）で作業する。

```sh
sudo mkdir /mnt/data1/web/rehu-blog
sudo chown -R $USER:$USER /mnt/data1/web/rehu-blog
```

サーバーコンピューター上に、ビルド済みファイルを保存するフォルダーを作成した。

```sh
docker --version
docker compose --version
```

DockerとDocker Composeはいずれもインストール済みである。

次は[[Cloudflare]]で作業する。

1. Cloudflareのダッシュボードへアクセスし、`Networking > Tunnels`メニューへ移動する。
2. `Create Tunnel`からトンネルを作成する。
3. OSには`Docker`を選び、表示されたターミナルコマンドをサーバーコンピューターで実行する。

```sh
docker ps -a
docker rm [コンテナ_ID]
```

Portainerで管理するため、コンテナを<kbd>Ctrl C</kbd>で終了し、そのまま削除した。

```YAML
services:
  tunnel:
    image: cloudflare/cloudflared:latest
    container_name: cloudflare-tunnel
    restart: always
    command: tunnel run --token [トークンを貼り付け]
```

Portainerにスタックを追加する。これでサーバーを再起動しても、Tunnelが自動的に立ち上がる。

続いて、Cloudflareのダッシュボードで作業する。

1. Tunnelの設定ページで`Add route > published application`を選択する。
2. 登録済みのドメインを選択する。
3. Service URLに`http://<サーバーIP>:8088`と入力する（ポート番号は任意に設定）。

```env title=".env.deploy"
DEPLOY_HOST=<SSH接続先IP>
DEPLOY_USER=<SSHユーザー名>
DEPLOY_PORT=22
DEPLOY_REMOTE_PATH=/opt/rehu-blog
DEPLOY_BIND_PORT=8088
```

次に、プロジェクトフォルダーへ**環境変数ファイル（.env）**を作成した。環境変数ファイルには重要な情報が含まれるため、通常はコミットの対象から外す。このファイルも`.gitignore`へ追加する。

```YAML title="docker-compose.yml"
services:
  web:
    build:
      context: .
      dockerfile: Dockerfile
    image: rehu-blog:latest
    container_name: rehu-blog
    restart: unless-stopped
    ports:
      - "${DEPLOY_BIND_PORT}:80"
```

`deploy/`フォルダーを作成し、その中に`docker-compose.yml`を記述した。この設定は、現在のディレクトリにあるDockerfileを読み込んで`rehu-blog:latest`というイメージをビルドし、それを`rehu-blog`という名前のコンテナとして実行する、という意味である。

詳しい説明：

- `web`という名前のサービスは、ソースコードをもとにDockerイメージを作成する。
- `context: .`は現在のディレクトリ（`deploy/`）をビルドコンテキストに指定する。この場所にあるファイルがビルド中にDockerデーモンへ送られる。ビルドに使用するDockerfileの名前は`Dockerfile`である。
- ビルドされるイメージの名前とタグは`rehu-blog:latest`となり、コンテナ名も`rehu-blog`となる。このコンテナはサーバーの再起動時や電源を入れ直した際には自動で再起動するが、ユーザーが明示的に停止した場合は、`unless-stopped`の指定により再起動しない。
- `ports:`はホストマシンとコンテナ内部のポートを接続する。外部からホスト側のポート番号へアクセスすると、コンテナ内部の80番ポートにつながる。

```dockerfile title="Dockerfile"
FROM nginx:1.27-alpine

COPY nginx/default.conf /etc/nginx/conf.d/default.conf
COPY site/ /usr/share/nginx/html/
```

`deploy/`フォルダーに`Dockerfile`を作成した。Nginxウェブサーバーをデプロイする構成であり、イメージのビルド時にウェブサーバーの設定ファイルとビルド済みのウェブサイトファイルがすべて組み込まれる。

詳しい説明：

- Nginx 1.27を使用する。サイズが小さく軽量なAlpine Linuxイメージを採用している。
- ホストマシンの`nginx/default.conf`を、コンテナ内の`/etc/nginx/conf.d/default.conf`へコピーする。以後、Nginxの設定を変更するときはホストマシン側のファイルを修正すれば反映される。
- ホストマシンの`site/`ディレクトリにある全ファイルを、コンテナのウェブルートである`/usr/share/nginx/html/`へコピーする。

```conf title="default.conf"
server {
    listen 80;
    server_name _;

    root /usr/share/nginx/html;
    index index.html;

    location / {
        try_files $uri $uri/ =404;
    }
}
```

`deploy/nginx/`フォルダーにNginxの設定ファイル`default.conf`を作成した。Nginxの基本設定では、ポートやパス、リダイレクト規則などを指定する。

詳しい説明：

- `listen 80;`は、80番ポートへ届くすべてのHTTPリクエストに応答する。
- `server_name _;`は、アクセス元のドメインを問わないワイルドカード設定である。
- ウェブサイトのファイルが置かれたルートフォルダーを参照し、デフォルトでは`index.html`を表示する。
- `location / {...}`は、ウェブサイトのすべてのパスに適用される規則である。ユーザーがURLへアクセスすると、まず`$uri`で要求されたファイルが実在するかを確認し、次に`$uri/`で同名のフォルダーがあるかを確認する。どちらも存在しなければ、`=404`によって404ページを表示する。

```json title="package.json"
"scripts": {
  "dev": "astro dev",
  "build": "astro build",
  "preview": "astro preview",
  "astro": "astro",
  "deploy": "node ./scripts/deploy.mjs"
},
```

`package.json`にdeployコマンドを追加する。これで`npm run deploy`からデプロイスクリプトを実行できる。

`npm run deploy`コマンドは、次の順序で動作する。

1. ローカルPCで`astro build`を実行してビルドする。
2. 生成された`dist/`のファイルを、一時パッケージ内の`site/`として構成する。
3. `deploy`フォルダーの内容と一緒にtar形式で圧縮する。
4. Ubuntuサーバーへアップロードする。
5. サーバー上で`nginx`のDockerコンテナを再起動する。

```js title="scripts/deploy.mjs"
（省略）
```

デプロイスクリプトは`scripts/deploy.mjs`を作成して記述する。AIに作ってもらったのだが、正直なところ複雑すぎて、眺めてもよく分からない。

毎回`dist/`全体をtarでアップロードし、Nginxイメージを再ビルドする方式なので、非常に大きなサイトになればrsyncやbind mountを使ったデプロイのほうが効率的だろう。しかし今のところは、サーバーにNodeやnpmを置かずに済む、単純で安定した方式なのだという。改善はまた今度にしよう。

### Astroの基礎知識

フォルダーをいくつか追加し、次のような構成にする。

```text
/ 
├── public/      # 静的ファイル（ファビコン、フォント、OG画像、robots.txtなど）
├── src/
│   ├── components/     # 再利用可能なコンポーネント
│   ├── content/        # Markdownコンテンツ
│   ├── layouts/        # ページレイアウト
│   └── pages/          # ファイル名に基づくルート
│       └── index.astro
├── astro.config.mjs
└── package.json
```

`src/pages/`ディレクトリにファイルを作成すると、URLのパスが生成される。たとえば`src/pages/b/aoegame.astro`を作ると、`ドメインアドレス/b/aoegame`というパスができる。この方式を「ファイルベースルーティング」と呼ぶ。

`index.astro`の場合は、フォルダーそのものがパスになる。つまり、`pages/index.astro`にはドメインのルートアドレスからアクセスでき、`pages/b/index.astro`には`ドメインアドレス/b/`からアクセスする。ページとして使えるのは`.astro`ファイルだけではなく、Markdownファイルの`.md`や`.mdx`も同様である。どのファイルもビルド時に自動でHTMLへ変換される。

`public/`ディレクトリの中身は、ビルド時に特別な最適化を施されることなく、そのままコピーされる。robots.txtなど、最適化を必要としないファイルを置く場所である。

「動的ルーティング（Dynamic Routing）」を使えば、単一のファイルから複数のページを作成することもできる。これにより、コンテンツが`/pages/`ディレクトリの外にあってもページを生成できる。

```astro title="example.astro"
---
// コンポーネントスクリプト
interface Props {
  name: string;
  greeting?: string;
}

const { name, greeting = "こんにちは" } = Astro.props;
const currentYear = new Date().getFullYear();
---

<!-- HTMLテンプレート -->
<div class="greeting>
  <h2>{greeting}, {name}!</h2>
  <p>今年は{currentYear}年です。</p>
</div>

<style>
  /* スコープ付きスタイル */
  .greeting {
    padding: 1rem;
  }
</style>
```

Astroの構文は、HTMLを基本としている。**すべてのHTMLファイルは有効なAstroファイルでもある**ため、HTMLの上位集合のようなものだと考えればよい。そこへJavaScriptの構文を加えられ、特定のタグ内にはCSSも記述できるという混成型である。

ファイルの先頭にある、コードフェンス`---`で囲まれた情報を**フロントマター（Frontmatter）**と呼ぶ。Markdownファイル`.md`では、タグや投稿画像などの情報をYAML形式で記述する。ページに自動で表示されるわけではないが、さまざまな用途に活用できる。一方、`.astro`ファイルのフロントマターにはJavaScriptコードが含まれる。ここに書いたコードはビルド時またはサーバー上でのみ実行され、ブラウザーへは送られない。

HTMLテンプレートのセクションでも、あらゆるJavaScript構文を使用できる。ただし、中括弧`{ }`で囲む必要がある。`<style>`ブロックにはCSSを記述でき、そのスタイルはこのコンポーネントだけに適用される。

厳密に区切られているわけではないが、大きくJavaScript・HTML・CSSのセクションに分かれていると考えればよい。ひとつの`.astro`ファイル内で、ウェブ三種の神器をすべて扱えるというわけである。これはReactのJSX構文に似ており、公式ドキュメントでもJSXの構文を参考にするよう勧めている。

## ナビゲーションバーの実装（v0.1）

それらしい見た目を作ってみよう。愛着のある韓国のコミュニティサイト、DCinsideを喜んでオマージュすることにした。

### ナビゲーションバー

DCinsideには、ロゴと検索欄が配置された`ヘッダー`があり、その下にはギャラリー、マイナーギャラリー、ミニギャラリー、人物ギャラリーなどへ移動するための`ナビゲーションバー`がある。

![[blog project; navigation bar prototype]]


[^1]: Wikipedia, [‘Chip log’](https://en.wikipedia.org/wiki/Chip_log)
[^2]: Nautical and Historical Museum of Galaxidi, ‘[Measuring speed - Hand log](https://galaxidi-museum.gr/en/measuring-speed-hand-log/)’：ギリシャ最古の海洋博物館のウェブサイト。Galaxidiはギリシャ中部にある海辺の町である。ウェブサイト上でも展示の一部を見学できる。
[^3]: Wikipedia, ‘[Blog](https://en.wikipedia.org/wiki/Blog)’
