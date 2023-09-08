import {calculateArea, disableConfigTarget, questionNumberArea} from "./globals";

export function isTouchDevice() {
    return window.ontouchstart === null;
}

export function setFullscreenMode(on: boolean) {
    if (on) {
        expandCalculateArea();
        calculateArea.dataset.fullScreen = "1";
    } else {
        contractCalculateArea();
        calculateArea.dataset.fullScreen = "0";
    }
}

export function toggleFullscreenMode() {
    if (isFullscreen()) {
        setFullscreenMode(false)
    } else {
        setFullscreenMode(true)
    }
}

export function isFullscreen() {
    return calculateArea.dataset.fullScreen === '1';
}

/**
 * ボタンを無効化する。
 */
export function disableHtmlButtons() {
    disableConfigTarget.map((element) => element.disabled = true);
}

/**
 * ボタンを有効化する。
 */
export function enableHtmlButtons() {
    disableConfigTarget.map((element) => element.disabled = false);
}

/**
 * 出題数字エリアを表示する。
 */
export function expandCalculateArea() {
    calculateArea.classList.add('full-screen');
    questionNumberArea.classList.add('big-size-number');
}

/**
 * 出題数字エリアを隠す。
 */
export function contractCalculateArea() {
    questionNumberArea.classList.remove('big-size-number');
    calculateArea.classList.remove('full-screen');
}
