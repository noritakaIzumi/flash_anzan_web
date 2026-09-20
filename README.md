# flash_anzan_web

## GitHub Pages へのデプロイ

GitHub リポジトリの **Settings → Pages → Build and deployment → Source** で **GitHub Actions** を選択してください。
設定の詳細は [GitHub の公式ドキュメント](https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site) を参照してください。

`main` への push で [pages.yml](.github/workflows/pages.yml) が `npm ci` と `npm run build` を実行し、`dist` を GitHub Pages に公開します。
Node.js のバージョンは `package.json` の `volta.node` を使用します。

## Windows でのデスクトップアプリのビルド

### 前提条件

以下がインストール済みであることを前提とします。

- **Volta**：Node.js・npm のバージョン管理に使用します。Node.js は [package.json](package.json) の `volta.node` で `24.11.1` に指定されています。
- **rustup**：Rust のツールチェーン管理に使用します。Windows では Rust の MSVC ツールチェーンが必要です。

プロジェクトのルートディレクトリで、各コマンドが利用できることを確認してください。

```powershell
volta --version
node --version
npm --version
rustup show
rustc --version
cargo --version
```

`node --version` が `v24.11.1`、`rustup show` のアクティブなツールチェーンが `x86_64-pc-windows-msvc` 向けであることを確認してください。

加えて、以下の手順で Visual Studio の C++ ビルドツールを準備します。

### C++ ビルドツールのインストール

PowerShell で次のコマンドを実行します。Build Tools 2022 に C++ ビルドツールと Windows SDK などの推奨コンポーネントを含めてインストールします。

```powershell
winget install --exact --id Microsoft.VisualStudio.2022.BuildTools --override "--wait --passive --norestart --add Microsoft.VisualStudio.Workload.VCTools --includeRecommended"
```

既にインストール済みでコンポーネントが追加されない場合は、Visual Studio Installer で「Build Tools 2022」→「変更」→「C++ によるデスクトップ開発」を選択してください。再起動を求められた場合は、再起動してからビルドします。

インストールオプションの詳細は [Microsoft の公式ドキュメント](https://learn.microsoft.com/en-us/visualstudio/install/use-command-line-parameters-to-install-visual-studio?view=vs-2022) を参照してください。

### MSIX Packaging Tool のインストール（MSIX 形式で配布する場合）

ビルドしたデスクトップアプリのインストーラーを MSIX 形式に変換する場合は、MSIX Packaging Tool をインストールします。Windows 10 バージョン 1809 以降（Windows 11 を含む）と、ツールを実行するための管理者権限が必要です。

1. PowerShell で次のコマンドを実行します。

   ```powershell
   winget install --exact --id 9N5LW3JBCXKF --source msstore
   ```

2. Microsoft Store へのサインインを求められた場合は、Microsoft アカウントでサインインし、画面の案内に従ってインストールを完了します。
3. スタートメニューから **MSIX Packaging Tool** を起動し、ホーム画面が表示されることを確認します。管理者権限を求められた場合は許可してください。

Microsoft Store で **MSIX Packaging Tool** を検索してインストールすることもできます。詳細やオフライン環境でのインストール方法は [Microsoft の公式ドキュメント](https://learn.microsoft.com/ja-jp/windows/msix/packaging-tool/tool-overview) を参照してください。

### ビルド

スタートメニューから **Developer PowerShell for VS 2022** を開き、プロジェクトのルートディレクトリで実行します。

```powershell
npm ci
npm run tauri build
```

GitHub Actions のリリース設定は [release.yml](.github/workflows/release.yml) を参照してください。この手順はローカルの Windows 環境向けです。
