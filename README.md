# flash_anzan_web

`index.html` をブラウザで開くとすぐに遊ぶことができます．

## Electron でアプリを生成する

Windows の場合

```shell script
npm i -D electron
npm i -D electron-packager
cd /path/to/flash_anzan
npx electron-packager src flash_anzan --platform=win32 --arch=x64 --overwrite
```
