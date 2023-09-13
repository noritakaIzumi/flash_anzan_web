import { flashDifficulty, type FlashDifficulty, savedParamsKeyName } from '../globals.js'
import { audioObj, soundExtension, type SoundExtension } from '../sound.js'
import { button, modals } from '../dom/htmlElement.js'
import { type flashParamElementCategoryName, flashParamElements } from '../dom/flashParamElements.js'
import {
    type FlashDifficultyParamSchema,
    type FlashIsMutedParamSchema,
    type FlashNumberParamSchema,
    type FlashNumberParamWithDifficultySupportSchema,
    type FlashSoundExtensionParamSchema
} from './flashParamSchema.js'

export function fixValue(limit: {
    max: number
    min: number
}, targetValue: number): number {
    return Math.floor(Math.min(limit.max, Math.max(limit.min, targetValue)))
}

const tempValueStore: Record<string, string | undefined> = {}

export function setupInputElementForTouch(element: HTMLInputElement): void {
    element.addEventListener('focus', () => {
        tempValueStore[element.id] = element.value
        element.value = ''
    })
    element.addEventListener('blur', () => {
        if (element.value === '') {
            element.value = tempValueStore[element.id] ?? ''
            tempValueStore[element.id] = undefined
        }
    })
}

abstract class FlashParam<K extends HTMLElement & {
    value: string
}, T, U, VOptions = never> {
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

    protected htmlElement: K
    protected schema: T

    protected constructor(props: {
        htmlElement: K
        schema: T
        options?: VOptions
    }) {
        this.htmlElement = props.htmlElement
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

    increaseParam(amount: number): void {
        this.valueV1 = fixValue(this.schema, Math.floor(this.valueV1) + amount)
    }

    updateParam(): FlashNumberParam {
        this.increaseParam(0)
        return this
    }
}

export class FlashNumberWithDifficultySupportParam extends FlashParam<HTMLInputElement, FlashNumberParamWithDifficultySupportSchema, number> {
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
        schema: FlashNumberParamWithDifficultySupportSchema
    }) {
        super(props)
        this.valueV1 = this.schema.default
        this.htmlElement.max = String(this.schema.max)
        this.htmlElement.min = String(this.schema.min)
        setupInputElementForTouch(this.htmlElement)
    }

    increaseParam(amount: number): void {
        this.valueV1 = fixValue(this.schema, Math.floor(this.valueV1) + amount)
    }

    updateParam(): FlashNumberParam {
        this.increaseParam(0)
        return this
    }
}

export class FlashTimeParam extends FlashParam<HTMLInputElement, FlashNumberParamSchema, number> {
    get valueV1(): number {
        return Number(this.htmlElement.value) * 1000
    }

    set valueV1(value: string | number) {
        this.htmlElement.value = String(Number(value) / 1000)
        this.htmlElement.max = String(this.schema.max)
        this.htmlElement.min = String(this.schema.min)
    }

    get valueV0(): string {
        return this.htmlElement.value
    }

    set valueV0(value: string) {
        this.valueV1 = Number(value) * 1000
    }

    constructor(props: {
        htmlElement: HTMLInputElement
        schema: FlashNumberParamSchema
    }) {
        super(props)
        this.valueV1 = this.schema.default
        setupInputElementForTouch(this.htmlElement)
    }

    increaseParam(amount: number): void {
        this.valueV1 = fixValue(this.schema, Math.floor(this.valueV1) + amount)
    }

    updateParam(): FlashTimeParam {
        this.increaseParam(0)
        return this
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

interface FlashIsMutedParamOptions {
    buttonElement: HTMLInputElement
    audioStatusElement: HTMLLabelElement
}

export class FlashIsMutedParam extends FlashParam<
HTMLInputElement,
FlashIsMutedParamSchema,
boolean,
FlashIsMutedParamOptions
> {
    private readonly buttonElement: HTMLInputElement
    private readonly audioStatusElement: HTMLLabelElement

    get valueV1(): boolean {
        return this.buttonElement.checked
    }

    set valueV1(value: boolean) {
        if (value) {
            this.buttonElement.checked = true
            this.htmlElement.value = 'on'
            this.audioStatusElement.innerHTML = '<i class="bi bi-volume-mute"></i><span class="ps-2">オフ</span>'
        } else {
            this.buttonElement.checked = false
            this.htmlElement.value = 'off'
            this.audioStatusElement.innerHTML = '<i class="bi bi-volume-up"></i><span class="ps-2">オン</span>'
        }
    }

    get valueV0(): string {
        return this.valueV1 ? 'on' : 'off'
    }

    set valueV0(value: string) {
        if (value === 'on') {
            this.valueV1 = true
            return
        }
        if (value === 'off') {
            this.valueV1 = false
            return
        }
        throw new RangeError(`invalid param: isMuted=${value}`)
    }

    constructor(props: {
        htmlElement: HTMLInputElement
        schema: {
            default: boolean
        }
        options: FlashIsMutedParamOptions
    }) {
        super(props)
        this.buttonElement = props.options.buttonElement
        this.audioStatusElement = props.options.audioStatusElement
        this.valueV1 = props.schema.default
    }
}

export class FlashSoundExtensionParam extends FlashParam<
HTMLSelectElement,
FlashSoundExtensionParamSchema,
SoundExtension
> {
    get valueV1(): SoundExtension {
        return this.htmlElement.value as SoundExtension
    }

    set valueV1(value: SoundExtension) {
        this.htmlElement.value = value
        this.htmlElement.dispatchEvent(new Event('change'))
    }

    get valueV0(): SoundExtension {
        return this.valueV1
    }

    set valueV0(value: string) {
        if (!(soundExtension as unknown as string[]).includes(value)) {
            throw new RangeError('invalid extension')
        }
        this.valueV1 = value as SoundExtension
    }

    constructor(props: {
        htmlElement: HTMLSelectElement
        schema: {
            default: SoundExtension
        }
        options?: never
    }) {
        super(props)
        this.valueV1 = props.schema.default
        this.htmlElement.addEventListener('change', () => {
            audioObj.load(this.htmlElement.value as SoundExtension)
        })
    }
}

export function doLoadParams(): void {
    const modal = modals.params.load.complete
    const modalMessage = modal.querySelector('.modal-body > p')
    if (modalMessage === null) {
        throw new Error('element not found: modal message')
    }

    const loadedParams = localStorage.getItem(savedParamsKeyName)
    if (loadedParams === null) {
        modalMessage.innerHTML = '設定がありません'
        return
    }
    modalMessage.innerHTML = '設定を読み込みました'

    const parsedParams = JSON.parse(loadedParams)
    Object.keys(parsedParams).forEach(mode => {
        switch (mode as keyof typeof flashParamElements) {
            case 'addition':
                flashParamElements.addition.digit.valueV0 = parsedParams.addition.digit
                flashParamElements.addition.length.valueV0 = parsedParams.addition.length
                flashParamElements.addition.time.valueV0 = parsedParams.addition.time
                break
            case 'multiplication':
                flashParamElements.multiplication.digit1.valueV0 = parsedParams.multiplication.digit1
                flashParamElements.multiplication.digit2.valueV0 = parsedParams.multiplication.digit2
                flashParamElements.multiplication.length.valueV0 = parsedParams.multiplication.length
                flashParamElements.multiplication.time.valueV0 = parsedParams.multiplication.time
                break
            case 'common':
                flashParamElements.common.difficulty.valueV0 = parsedParams.common.difficulty
                flashParamElements.common.flashRate.valueV0 = parsedParams.common.flashRate
                flashParamElements.common.offset.valueV0 = parsedParams.common.offset
                flashParamElements.common.isMuted.valueV0 = parsedParams.common.isMuted
                flashParamElements.common.soundExtension.valueV0 = parsedParams.common.soundExtension
                break
        }
    })

    // 難易度選択
    button.difficulty[flashParamElements.common.difficulty.valueV1].checked = true
}

export function doSaveParams(): void {
    const params: {
        [key in keyof typeof flashParamElementCategoryName]: Record<string, string>
    } = {
        addition: {},
        multiplication: {},
        common: {},
    }

    params.addition.digit = flashParamElements.addition.digit.valueV0
    params.addition.length = flashParamElements.addition.length.valueV0
    params.addition.time = flashParamElements.addition.time.valueV0
    params.multiplication.digit1 = flashParamElements.multiplication.digit1.valueV0
    params.multiplication.digit2 = flashParamElements.multiplication.digit2.valueV0
    params.multiplication.length = flashParamElements.multiplication.length.valueV0
    params.multiplication.time = flashParamElements.multiplication.time.valueV0
    params.common.difficulty = flashParamElements.common.difficulty.valueV0
    params.common.flashRate = flashParamElements.common.flashRate.valueV0
    params.common.offset = flashParamElements.common.offset.valueV0
    params.common.isMuted = flashParamElements.common.isMuted.valueV0
    params.common.soundExtension = flashParamElements.common.soundExtension.valueV0

    localStorage.setItem(savedParamsKeyName, JSON.stringify(params))
}

export function doDeleteParams(): void {
    localStorage.clear()
}
