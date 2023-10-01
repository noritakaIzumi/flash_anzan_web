import { flashParamElements, type FlashParamElements } from "../dom/flashParamElements.js"
import { checkboxes } from "../dom/htmlElement.js"
import { FlashLengthAndTimeMemory } from "./flashLengthAndTimeMemory.js"
import { type FlashMode } from "../globals.js"

export abstract class FlashParamElementsManager<T extends FlashMode> {
    protected readonly elements: FlashParamElements[T]
    private readonly flashLengthAndTimeMemory: FlashLengthAndTimeMemory

    constructor(props: { elements: FlashParamElements[T], flashLengthAndTimeMemory: FlashLengthAndTimeMemory }) {
        this.elements = props.elements
        this.flashLengthAndTimeMemory = props.flashLengthAndTimeMemory
        this.initialize()
    }

    protected initialize(): void {
        // 表示間隔を固定するオプション
        checkboxes.fixNumberInterval.addEventListener("change", () => {
            const lengthParam = this.elements.length
            const timeParam = this.elements.time
            if (checkboxes.fixNumberInterval.checked) {
                timeParam.disableElement()
                this.flashLengthAndTimeMemory.save({ length: lengthParam.valueV1, time: timeParam.valueV1 })
            } else {
                timeParam.enableElement()
                this.flashLengthAndTimeMemory.delete()
            }
        })

        this.elements.length.htmlElement.addEventListener("change", event => {
            event.preventDefault()
            this._length = Number(this.elements.length.htmlElement.value)
        })

        const setTimeFromElements = (event: Event): void => {
            event.preventDefault()
            this._time =
                Number(this.elements.time.digitElements.int.value) * 1000 +
                Number(this.elements.time.digitElements.dec1.value) * 100 +
                Number(this.elements.time.digitElements.dec2.value) * 10
        }
        this.elements.time.digitElements.int.addEventListener("change", setTimeFromElements)
        this.elements.time.digitElements.dec1.addEventListener("change", setTimeFromElements)
        this.elements.time.digitElements.dec2.addEventListener("change", setTimeFromElements)
    }

    private set _length(length: number) {
        this.elements.length.valueV1 = length
        if (checkboxes.fixNumberInterval.checked) {
            this.elements.time.valueV1 = this.flashLengthAndTimeMemory.expandTime(length)
        }
    }

    private get _length(): number {
        return this.elements.length.valueV1
    }

    getValidatedLength(): number {
        this.increaseLength(0)
        return this._length
    }

    increaseLength(diff: number): void {
        this._length += diff
    }

    private set _time(time: number) {
        this.elements.time.valueV1 = time
    }

    private get _time(): number {
        return this.elements.time.valueV1
    }

    getValidatedTime(): number {
        this.increaseTime(0)
        return this._time
    }

    increaseTime(diff: number): void {
        if (checkboxes.fixNumberInterval.checked) {
            return
        }
        this._time += diff
    }
}

export class AdditionModeFlashParamElementsManager extends FlashParamElementsManager<"addition"> {
    protected initialize(): void {
        super.initialize()
        this.elements.digit.htmlElement.addEventListener("change", event => {
            event.preventDefault()
            this._digit = Number(this.elements.digit.htmlElement.value)
        })
    }

    set _digit(digit: number) {
        this.elements.digit.valueV1 = digit
    }

    get _digit(): number {
        return this.elements.digit.valueV1
    }

    getValidatedDigit(): number {
        this.increaseDigit(0)
        return this._digit
    }

    increaseDigit(diff: number): void {
        this._digit += diff
    }
}

export class MultiplicationModeFlashParamElementsManager extends FlashParamElementsManager<"multiplication"> {
    protected initialize(): void {
        super.initialize()
        this.elements.digit1.htmlElement.addEventListener("change", event => {
            event.preventDefault()
            this._digit1 = Number(this.elements.digit1.htmlElement.value)
        })
        this.elements.digit2.htmlElement.addEventListener("change", event => {
            event.preventDefault()
            this._digit2 = Number(this.elements.digit2.htmlElement.value)
        })
    }

    private set _digit1(digit: number) {
        this.elements.digit1.valueV1 = digit
    }

    private get _digit1(): number {
        return this.elements.digit1.valueV1
    }

    getValidatedDigit1(): number {
        this.increaseDigit1(0)
        return this._digit1
    }

    increaseDigit1(diff: number): void {
        this._digit1 += diff
    }

    private set _digit2(digit: number) {
        this.elements.digit2.valueV1 = digit
    }

    private get _digit2(): number {
        return this.elements.digit2.valueV1
    }

    getValidatedDigit2(): number {
        this.increaseDigit2(0)
        return this._digit2
    }

    increaseDigit2(diff: number): void {
        this._digit2 += diff
    }
}

export const additionModeFlashParamElementsManager = new AdditionModeFlashParamElementsManager({
    elements: flashParamElements.addition,
    flashLengthAndTimeMemory: new FlashLengthAndTimeMemory(),
})
export const multiplicationModeFlashParamElementsManager = new MultiplicationModeFlashParamElementsManager({
    elements: flashParamElements.multiplication,
    flashLengthAndTimeMemory: new FlashLengthAndTimeMemory(),
})
