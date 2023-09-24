// eslint-disable-next-line @typescript-eslint/triple-slash-reference
/// <reference types="vite/client" />

interface ImportMetaEnv {
    readonly VITE_APP_TITLE: string
    // more env variables...
}

interface ImportMeta {
    readonly env: ImportMetaEnv
}

// 問題を生成してから出題カウントダウンのビープ音を鳴らすまでの時間 (ms)
declare const APP_CONFIG_FIRST_BEEP_TIMING: number
// ビープ音の間隔 (ms)
declare const APP_CONFIG_BEEP_INTERVAL: number
// ビープ音の回数
declare const APP_CONFIG_BEEP_COUNT: number
// 最初の数字が表示されるタイミング (ms)
declare const APP_CONFIG_FIRST_TICK_TIMING: number
// 「はじめる」ボタンを押してから音声とフォントが読み込まれるまでのタイムアウト時間
declare const APP_CONFIG_WAIT_SOUNDS_AND_FONTS_LOADED_TIMEOUT: number
