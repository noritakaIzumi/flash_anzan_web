import {element, isMutedMap, modals, savedParamsKeyName} from "./globals";
import {loadAudioObj, toggleMute} from "./sound";
import {getHtmlElement} from "./htmlElement";

export function doLoadParams() {
    const modal = modals.params.load.complete;
    const modalMessage = modal.querySelector('.modal-body > p');

    const loadedParams = localStorage.getItem(savedParamsKeyName);
    if (!loadedParams) {
        modalMessage.innerHTML = '設定がありません';
        return;
    }
    modalMessage.innerHTML = '設定を読み込みました';

    const parsedParams = JSON.parse(loadedParams);
    Object.keys(parsedParams).map(
        (mode) => {
            Object.keys(parsedParams[mode]).map(
                (paramName) => {
                    element[mode][paramName].value = parsedParams[mode][paramName];
                });
        }
    );

    element.common.isMuted.checked = element.common.isMuted.value === isMutedMap.on;
    toggleMute();
    loadAudioObj(element.common.soundExtension.value);
    // 難易度選択
    getHtmlElement("input", `difficulty-${element.common.difficulty.value}`).checked = true;
}

export function doSaveParams() {
    const params = {};
    Object.keys(element).map(
        (mode) => {
            params[mode] = {};
            Object.keys(element[mode]).map(
                (paramName) => {
                    params[mode][paramName] = element[mode][paramName].value;
                });
        }
    );
    localStorage.setItem(savedParamsKeyName, JSON.stringify(params));
}

export function doDeleteParams() {
    localStorage.clear();
}
