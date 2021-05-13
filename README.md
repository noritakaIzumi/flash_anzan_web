# flash_anzan_web

- すぐに遊びたい方

https://technical-study.gitlab.io/flash_anzan_web/

- リポジトリをクローンした方

`index.html` をブラウザで開いても遊ぶことができます．

## Electron アプリのビルド方法

- ターミナルを管理者権限で開く。

- ライブラリをインストールする。

```bash
$ cd /path/to/flash_anzan_web
$ npm install
```

- 次のコマンドを実行する。

```bash
npm run release
```

## その他

- 難易度境界リストの作成

```bash
node ./tools/create_complexity_map.js
```
