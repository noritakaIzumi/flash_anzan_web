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
            this.setLength(Number(this.elements.length.htmlElement.value))
        })
    }

    private setLength(length: number): void {
        this.elements.length.valueV1 = length
        if (checkboxes.fixNumberInterval.checked) {
            this.elements.time.valueV1 = this.flashLengthAndTimeMemory.expandTime(length)
        }
    }

    increaseLength(diff: number): void {
        this.setLength(this.elements.length.valueV1 + diff)
    }
}

export class AdditionModeFlashParamElementsManager extends FlashParamElementsManager<"addition"> {
    protected initialize(): void {
        super.initialize()
        this.elements.digit.htmlElement.addEventListener("change", event => {
            event.preventDefault()
            this.setDigit(Number(this.elements.digit.htmlElement.value))
        })
    }

    private setDigit(digit: number): void {
        this.elements.digit.valueV1 = digit
    }

    increaseDigit(diff: number): void {
        this.setDigit(this.elements.digit.valueV1 + diff)
    }
}

export class MultiplicationModeFlashParamElementsManager extends FlashParamElementsManager<"multiplication"> {
    protected initialize(): void {
        super.initialize()
        this.elements.digit1.htmlElement.addEventListener("change", event => {
            event.preventDefault()
            this.setDigit1(Number(this.elements.digit1.htmlElement.value))
        })
        this.elements.digit2.htmlElement.addEventListener("change", event => {
            event.preventDefault()
            this.setDigit2(Number(this.elements.digit2.htmlElement.value))
        })
    }

    private setDigit1(digit: number): void {
        this.elements.digit1.valueV1 = digit
    }

    private setDigit2(digit: number): void {
        this.elements.digit2.valueV1 = digit
    }

    increaseDigit1(diff: number): void {
        this.setDigit1(this.elements.digit1.valueV1 + diff)
    }

    increaseDigit2(diff: number): void {
        this.setDigit2(this.elements.digit2.valueV1 + diff)
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
