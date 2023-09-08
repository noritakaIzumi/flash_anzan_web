/* button events */

import {contractCalculateArea, expandCalculateArea, isFullscreen} from "./screen";
import {
    button,
    calculateArea,
    difficultyMap,
    flashParamConfig,
    flashParamElements,
    isMutedMap,
    modeNames
} from "./globals";
import {CurrentFlashMode} from "./currentFlashMode";
import {setMute} from "./sound";
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
    Object.keys(flashParamElements).map((mode) => {
        if (mode === 'common') {
            // difficulty
            flashParamElements.common.difficulty.value = flashParamConfig.common.difficulty.default;
            // flashRate
            flashParamElements.common.flashRate.max = String(flashParamConfig.common.flashRate.max);
            flashParamElements.common.flashRate.min = String(flashParamConfig.common.flashRate.min);
            flashParamElements.common.flashRate.value = String(flashParamConfig.common.flashRate.default);
            // offset
            flashParamElements.common.offset.max = String(flashParamConfig.common.offset.max);
            flashParamElements.common.offset.min = String(flashParamConfig.common.offset.min);
            flashParamElements.common.offset.value = String(flashParamConfig.common.offset.default);
            // isMuted
            button.isMuted.checked = flashParamConfig.common.isMuted.default;
            flashParamElements.common.isMuted.value = button.isMuted.checked ? isMutedMap.on : isMutedMap.off;
            setMute(button.isMuted.checked);
            // soundExtension
            flashParamElements.common.soundExtension.value = flashParamConfig.common.soundExtension.default;
            return;
        }
        Object.keys(flashParamElements[mode]).map((config) => {
            if (config === "time") {
                flashParamElements[mode][config].max = flashParamConfig[mode][config].max / 1000;
                flashParamElements[mode][config].min = flashParamConfig[mode][config].min / 1000;
                flashParamElements[mode][config].value = flashParamConfig[mode][config].default / 1000;
                flashParamElements[mode][config].step = flashParamConfig[mode][config].step / 1000;
            } else {
                flashParamElements[mode][config].max = flashParamConfig[mode][config].max;
                flashParamElements[mode][config].min = flashParamConfig[mode][config].min;
                flashParamElements[mode][config].value = flashParamConfig[mode][config].default;
            }
            flashParamElements[mode][config].onfocus = function () {
                this.tmp = this.value;
                this.value = "";
            };
            flashParamElements[mode][config].onblur = function () {
                if (this.value === "") {
                    this.value = this.tmp;
                }
            };
        });
    });
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
                flashParamElements.multiplication.digit1.updateParam().value,
                flashParamElements.multiplication.digit2.updateParam().value,
            ];
            requestParam.length = flashParamElements.multiplication.length.updateParam().value;
            requestParam.time = flashParamElements.multiplication.time.updateParam().value;
            break;
        case modeNames.addition:
            requestParam.digit = flashParamElements.addition.digit.updateParam().value
            requestParam.length = flashParamElements.addition.length.updateParam().value;
            requestParam.time = flashParamElements.addition.time.updateParam().value;
            break;
        default:
            throw new RangeError('invalid mode')
    }
    requestParam.difficulty = flashParamElements.common.difficulty.value;
    requestParam.flashRate = fixValue(
        flashParamConfig.common.flashRate,
        Number(flashParamElements.common.flashRate.value)
    );
    requestParam.offset = fixValue(
        flashParamConfig.common.offset,
        Number(flashParamElements.common.offset.value)
    );

    return requestParam;
}

/**
 * 難易度切り替え
 * @param {string} value
 */
export function switchDifficulty(value) {
    document.querySelector('#difficulty-' + value).checked = true;
    flashParamElements.common.difficulty.value = difficultyMap[value];
}
