import {button, flashParamElements, isMutedMap, modals, savedParamsKeyName} from "./globals";
import {loadAudioObj, setMute} from "./sound";
import {getHtmlElement} from "./htmlElement";
import {fixValue} from "./util_should_categorize";

abstract class FlashParam<K extends HTMLElement & { value: string }, T, U> {
    abstract get value(): U;
    protected abstract set value(value: string | number);

    protected htmlElement: K;
    protected schema: T;

    constructor(props: { htmlElement: K, schema: T }) {
        this.htmlElement = props.htmlElement
        this.schema = props.schema
    }
}

type FlashNumberParamSchema = {
    min: number,
    max: number,
    default: number,
}

export class FlashNumberParam extends FlashParam<HTMLInputElement, FlashNumberParamSchema, number> {
    get value(): number {
        return Number(this.htmlElement.value);
    }

    protected set value(value: string | number) {
        this.htmlElement.value = String(value)
    }

    increaseParam(amount: number): void {
        this.value = fixValue(this.schema, Math.floor(this.value) + amount)
    }

    updateParam(): FlashNumberParam {
        this.increaseParam(0)
        return this
    }
}

export class FlashTimeParam extends FlashParam<HTMLInputElement, FlashNumberParamSchema, number> {
    get value(): number {
        return Number(this.htmlElement.value) * 1000;
    }

    protected set value(value: string | number) {
        this.htmlElement.value = String(value)
    }

    increaseParam(amount: number): void {
        this.value = fixValue(this.schema, Math.floor(this.value) + amount) / 1000
    }

    updateParam(): FlashTimeParam {
        this.increaseParam(0)
        return this
    }
}

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
                    flashParamElements[mode][paramName].value = parsedParams[mode][paramName];
                });
        }
    );

    button.isMuted.checked = flashParamElements.common.isMuted.value === isMutedMap.on;
    setMute(button.isMuted.checked);
    loadAudioObj(flashParamElements.common.soundExtension.value);
    // 難易度選択
    getHtmlElement("input", `difficulty-${flashParamElements.common.difficulty.value}`).checked = true;
}

export function doSaveParams() {
    const params = {};
    Object.keys(flashParamElements).map(
        (mode) => {
            params[mode] = {};
            Object.keys(flashParamElements[mode]).map(
                (paramName) => {
                    params[mode][paramName] = flashParamElements[mode][paramName].value;
                });
        }
    );
    localStorage.setItem(savedParamsKeyName, JSON.stringify(params));
}

export function doDeleteParams() {
    localStorage.clear();
}
