import { button, calculateArea, disableConfigTarget, questionNumberArea } from './dom/htmlElement.js'
import { errorMessage } from './flash/errorMessage.js'

export function isTouchDevice(): boolean {
    return window.ontouchstart === null
}

export function setFullscreenMode(on: boolean): void {
    if (on) {
        expandCalculateArea()
        calculateArea.dataset.fullScreen = '1'
    } else {
        contractCalculateArea()
        calculateArea.dataset.fullScreen = '0'
    }
}

export function toggleFullscreenMode(): void {
    if (isFullscreen()) {
        setFullscreenMode(false)
    } else {
        setFullscreenMode(true)
    }
}

export function isFullscreen(): boolean {
    return calculateArea.dataset.fullScreen === '1'
}

/**
 * ボタンを無効化する。
 */
export function disableHtmlButtons(): void {
    disableConfigTarget.forEach((element) => {
        element.disabled = true
    })
}

/**
 * ボタンを有効化する。
 */
export function enableHtmlButtons(): void {
    disableConfigTarget.forEach((element) => {
        element.disabled = false
    })
}

/**
 * 出題数字エリアを表示する。
 */
export function expandCalculateArea(): void {
    calculateArea.classList.add('full-screen')
    questionNumberArea.classList.add('big-size-number')
}

/**
 * 出題数字エリアを隠す。
 */
export function contractCalculateArea(): void {
    questionNumberArea.classList.remove('big-size-number')
    calculateArea.classList.remove('full-screen')
}

function setDisabledDifficultySelect(disabled: boolean): void {
    button.difficulty.easy.disabled = disabled
    button.difficulty.normal.disabled = disabled
    button.difficulty.hard.disabled = disabled
}

/**
 * 難易度選択ボタンを無効にする
 */
export function disableDifficultySelect(): void {
    setDisabledDifficultySelect(true)
    errorMessage.addError('difficultyNotSupported')
}

/**
 * 難易度選択ボタンを有効にする
 */
export function enableDifficultySelect(): void {
    setDisabledDifficultySelect(false)
    errorMessage.removeError('difficultyNotSupported')
}
