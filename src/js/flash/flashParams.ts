import { flashDifficulty, type FlashDifficulty } from "../globals.js"
import { button } from "../dom/htmlElement.js"
import {
    type FlashDifficultyParamSchema,
    type FlashNumberParamSchema,
    type FlashNumberParamWithDifficultySupportSchema
} from "./flashParamSchema.js"

export function fixValue(limit: {
    max: number
    min: number
}, targetValue: number): number {
    return Math.floor(Math.min(limit.max, Math.max(limit.min, targetValue)))
}

const tempValueStore: Record<string, string | undefined> = {}

export function setupInputElementForTouch(element: HTMLInputElement): void {
    element.addEventListener("focus", () => {
        tempValueStore[element.id] = element.value
        element.value = ""
    })
    element.addEventListener("blur", () => {
        if (element.value === "") {
            element.value = tempValueStore[element.id] ?? ""
            tempValueStore[element.id] = undefined
        }
    })
}

abstract class FlashParam<K extends HTMLElement & {
    value: string
}, T, U, VOptions = never> {
    get htmlElement(): K {
        return this._htmlElement
    }

    abstract get valueV1(): U
    abstract set valueV1(value: string | number)

    /**
     * 保存用パラメータを書き出す。設定パラメータの下位互換性を保持する。
     */
    abstract get valueV0(): string
    /**
     * 保存用パラメータから読み込む。設定パラメータの下位互換性を保持する。
     */
    abstract set valueV0(value: string)

    private readonly _htmlElement: K
    protected schema: T

    protected constructor(props: {
        htmlElement: K
        schema: T
        options?: VOptions
    }) {
        this._htmlElement = props.htmlElement
        this.schema = props.schema
    }
}

export class FlashNumberParam extends FlashParam<HTMLInputElement, FlashNumberParamSchema, number> {
    get valueV1(): number {
        return Number(this.htmlElement.value)
    }

    set valueV1(value: string | number) {
        this.htmlElement.value = String(value)
    }

    get valueV0(): string {
        return this.htmlElement.value
    }

    set valueV0(value: string) {
        this.valueV1 = value
    }

    constructor(props: {
        htmlElement: HTMLInputElement
        schema: FlashNumberParamSchema
    }) {
        super(props)
        this.valueV1 = this.schema.default
        this.htmlElement.max = String(this.schema.max)
        this.htmlElement.min = String(this.schema.min)
        setupInputElementForTouch(this.htmlElement)
    }
}

export class FlashNumberWithDifficultySupportParam extends FlashParam<HTMLSelectElement, FlashNumberParamWithDifficultySupportSchema, number> {
    get valueV1(): number {
        return Number(this.htmlElement.value)
    }

    set valueV1(value: string | number) {
        const fixedValue = fixValue(this.schema, Math.floor(Number(value)))
        this.htmlElement.value = String(fixedValue)
    }

    get valueV0(): string {
        return this.htmlElement.value
    }

    set valueV0(value: string) {
        this.valueV1 = value
    }

    constructor(props: {
        htmlElement: HTMLSelectElement
        schema: FlashNumberParamWithDifficultySupportSchema
    }) {
        super(props)
        for (let i = this.schema.min; i <= this.schema.max; i++) {
            const strNum = String(i)
            const element = document.createElement("option")
            element.value = strNum
            element.textContent = strNum
            this.htmlElement.appendChild(element)
        }
        this.valueV1 = this.schema.default
    }
}

export interface FlashTimeDigitElements {
    int: HTMLSelectElement
    dec1: HTMLSelectElement
    dec2: HTMLSelectElement
}

export class FlashTimeParam extends FlashParam<HTMLInputElement, FlashNumberParamSchema, number> {
    get digitElements(): FlashTimeDigitElements {
        return this._digitElements
    }

    private readonly _digitElements: FlashTimeDigitElements

    get valueV1(): number {
        return Math.round(Number(this.htmlElement.value) * 1000)
    }

    set valueV1(value: string | number) {
        const fixedValue = fixValue(this.schema, Math.floor(Number(value)))
        this.htmlElement.value = String(fixedValue / 1000)
        this.htmlElement.max = String(this.schema.max)
        this.htmlElement.min = String(this.schema.min)

        this._digitElements.int.value = String(Math.floor(fixedValue / 1000))
        this._digitElements.dec1.value = String(Math.floor((fixedValue % 1000) / 100))
        this._digitElements.dec2.value = String(Math.floor((fixedValue % 100) / 10))
    }

    get valueV0(): string {
        return this.htmlElement.value
    }

    set valueV0(value: string) {
        this.valueV1 = Math.round(Number(value) * 1000)
    }

    constructor(props: {
        htmlElement: HTMLInputElement
        digitElements: FlashTimeDigitElements
        schema: FlashNumberParamSchema
    }) {
        super(props)
        this._digitElements = props.digitElements
        this.setupDigitElements()
        this.valueV1 = this.schema.default
    }

    private concatValues(): string {
        return `${this._digitElements.int.value}${this._digitElements.dec1.value}${this._digitElements.dec2.value}0`
    }

    private setupDigitElements(): void {
        function addOptions(parent: HTMLSelectElement, start: number, end: number): void {
            for (let i = start; i <= end; i++) {
                const strNum = String(i)
                const element = document.createElement("option")
                element.value = strNum
                element.textContent = strNum
                parent.appendChild(element)
            }
        }

        addOptions(this._digitElements.int, Math.floor(this.schema.min / 1000), Math.floor(this.schema.max / 1000))
        addOptions(this._digitElements.dec1, 0, 9)
        addOptions(this._digitElements.dec2, 0, 9)
        this._digitElements.int.addEventListener("change", () => {
            this.valueV1 = this.concatValues()
        })
        this._digitElements.dec1.addEventListener("change", () => {
            this.valueV1 = this.concatValues()
        })
        this._digitElements.dec2.addEventListener("change", () => {
            this.valueV1 = this.concatValues()
        })
    }

    private changeDisabled(disabled: boolean): void {
        this._digitElements.int.disabled = disabled
        this._digitElements.dec1.disabled = disabled
        this._digitElements.dec2.disabled = disabled
    }

    disableElement(): void {
        this.changeDisabled(true)
    }

    enableElement(): void {
        this.changeDisabled(false)
    }
}

export class FlashDifficultyParam extends FlashParam<HTMLSelectElement, FlashDifficultyParamSchema, string> {
    get valueV1(): FlashDifficulty {
        return this.htmlElement.value as FlashDifficulty
    }

    set valueV1(value: FlashDifficulty) {
        button.difficulty[value].checked = true
        this.htmlElement.value = value
    }

    get valueV0(): string {
        return this.valueV1
    }

    set valueV0(value: string) {
        this.validateValue(value)
        this.valueV1 = value as FlashDifficulty
    }

    protected validateValue(value: string): void {
        if (!(flashDifficulty as unknown as string[]).includes(value)) {
            throw new RangeError(`invalid difficulty: ${value}`)
        }
    }

    constructor(props: {
        htmlElement: HTMLSelectElement
        schema: FlashDifficultyParamSchema
    }) {
        super(props)
        this.valueV1 = this.schema.default
    }
}
