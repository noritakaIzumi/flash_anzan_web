import {flashParamElements, modals, savedParamsKeyName} from "./globals";
import {loadAudioObj, SoundExtension} from "./sound";
import {getHtmlElement} from "./htmlElement";
import {fixValue} from "./util_should_categorize";

abstract class FlashParam<K extends HTMLElement & { value: string }, T, U, VOptions = never> {
    abstract get value(): U;
    protected abstract set value(value: string | number);

    protected htmlElement: K;
    protected schema: T;

    protected constructor(props: { htmlElement: K, schema: T, options?: VOptions }) {
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

    constructor(props: { htmlElement: HTMLInputElement; schema: FlashNumberParamSchema }) {
        super(props);
        this.value = this.schema.default
        this.htmlElement.max = String(this.schema.max)
        this.htmlElement.min = String(this.schema.min)
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
        this.htmlElement.value = String(Number(value) / 1000)
        this.htmlElement.max = String(this.schema.max)
        this.htmlElement.min = String(this.schema.min)
    }

    constructor(props: { htmlElement: HTMLInputElement; schema: FlashNumberParamSchema }) {
        super(props);
        this.value = this.schema.default
    }

    increaseParam(amount: number): void {
        this.value = fixValue(this.schema, Math.floor(this.value) + amount)
    }

    updateParam(): FlashTimeParam {
        this.increaseParam(0)
        return this
    }
}

type FlashDifficultyParamSchema = {
    in_list: readonly string[],
    default: string,
}

export class FlashDifficultyParam extends FlashParam<HTMLSelectElement, FlashDifficultyParamSchema, string> {
    get value(): string {
        return this.htmlElement.value;
    }

    set value(value: string) {
        this.validateValue(value)
        getHtmlElement("input", `difficulty-${value}`).checked = true;
        this.htmlElement.value = value
    }

    protected validateValue(value: string) {
        if (this.schema.in_list.indexOf(value) === -1) {
            throw new RangeError(`invalid difficulty: ${value}`)
        }
    }

    constructor(props: { htmlElement: HTMLSelectElement; schema: FlashDifficultyParamSchema }) {
        super(props);
        this.value = this.schema.default
    }
}

type FlashIsMutedParamOptions = {
    buttonElement: HTMLInputElement,
    audioStatusElement: HTMLLabelElement,
};

export class FlashIsMutedParam extends FlashParam<
    HTMLInputElement,
    { default: boolean },
    boolean,
    FlashIsMutedParamOptions
> {
    private buttonElement: HTMLInputElement;
    private audioStatusElement: HTMLLabelElement;

    get value(): boolean {
        return this.buttonElement.checked;
    }

    set value(value: boolean) {
        if (value) {
            this.buttonElement.checked = true;
            this.htmlElement.value = 'on';
            this.audioStatusElement.innerHTML = '<i class="bi bi-volume-mute"></i><span class="ps-2">オフ</span>';
        } else {
            this.buttonElement.checked = false;
            this.htmlElement.value = 'off';
            this.audioStatusElement.innerHTML = '<i class="bi bi-volume-up"></i><span class="ps-2">オン</span>';
        }
    }

    constructor(props: {
        htmlElement: HTMLInputElement,
        schema: { default: boolean },
        options: FlashIsMutedParamOptions
    }) {
        super(props);
        this.buttonElement = props.options.buttonElement
        this.audioStatusElement = props.options.audioStatusElement
        this.value = props.schema.default
    }
}

export class FlashSoundExtensionParam extends FlashParam<
    HTMLSelectElement,
    { default: SoundExtension },
    SoundExtension
> {
    get value(): SoundExtension {
        return this.htmlElement.value as SoundExtension;
    }

    set value(value: SoundExtension) {
        this.htmlElement.value = value;
        this.htmlElement.dispatchEvent(new Event("change"))
    }

    constructor(props: { htmlElement: HTMLSelectElement; schema: { default: SoundExtension }; options?: never }) {
        super(props);
        this.htmlElement.addEventListener("change", (evt) => loadAudioObj((evt.target as HTMLSelectElement).value))
        this.value = props.schema.default
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
