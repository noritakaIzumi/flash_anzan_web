/* button events */

import {contractCalculateArea, expandCalculateArea, isFullscreen} from "./screen";
import {calculateArea, difficultyMap, flashParamElements, modeNames} from "./globals";
import {CurrentFlashMode} from "./currentFlashMode";
import {changeShortcut} from "./shortcut";

export function toggleFullscreenMode(full) {
    if (full === true) {
        expandCalculateArea();
        calculateArea.dataset.fullScreen = "1";
    } else if (full === false) {
        contractCalculateArea();
        calculateArea.dataset.fullScreen = "0";
    } else if (!isFullscreen()) {
        expandCalculateArea();
        calculateArea.dataset.fullScreen = "1";
    } else {
        contractCalculateArea();
        calculateArea.dataset.fullScreen = "0";
    }
}

// TODO: このファイルをクラス化して共通部分をまとめる
//  switch 文もまとめる

export function fixValue(limit, targetValue) {
    return Math.floor(Math.min(limit.max, Math.max(limit.min, targetValue)));
}

export function setUpInputBox() {
    changeMode(modeNames.addition);
}

export function changeMode(mode) {
    changeShortcut(mode);
    CurrentFlashMode.getInstance().value = mode;
}

export function getCurrentParam() {
    let requestParam = {
        digit: 0,
        length: 0,
        time: 0,
        difficulty: "",
        flashRate: 0,
        offset: 0,
    };
    const currentFlashMode = CurrentFlashMode.getInstance().value;
    switch (currentFlashMode) {
        case modeNames.multiplication:
            requestParam.digit = [
                flashParamElements.multiplication.digit1.updateParam().valueV2,
                flashParamElements.multiplication.digit2.updateParam().valueV2,
            ];
            requestParam.length = flashParamElements.multiplication.length.updateParam().valueV2;
            requestParam.time = flashParamElements.multiplication.time.updateParam().valueV2;
            break;
        case modeNames.addition:
            requestParam.digit = flashParamElements.addition.digit.updateParam().valueV2
            requestParam.length = flashParamElements.addition.length.updateParam().valueV2;
            requestParam.time = flashParamElements.addition.time.updateParam().valueV2;
            break;
        default:
            throw new RangeError('invalid mode')
    }
    requestParam.difficulty = flashParamElements.common.difficulty.valueV2;
    requestParam.flashRate = flashParamElements.common.flashRate.updateParam().valueV2;
    requestParam.offset = flashParamElements.common.offset.updateParam().valueV2;

    return requestParam;
}

/**
 * 難易度切り替え
 * @param {string} value
 */
export function switchDifficulty(value) {
    document.querySelector('#difficulty-' + value).checked = true;
    flashParamElements.common.difficulty.valueV2 = difficultyMap[value];
}
