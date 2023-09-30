import { flashParamElements, type FlashParamElements } from "../dom/flashParamElements.js"
import { checkboxes } from "../dom/htmlElement.js"
import { flashLengthAndTimeMemories } from "./flashLengthAndTimeMemory.js"
import { type FlashMode, flashModes } from "../globals.js"

export class FlashParamElementsManager {
    private readonly elements: FlashParamElements

    constructor(elements: FlashParamElements) {
        this.elements = elements
        this.initialize()
    }

    private initialize(): void {
        for (const flashMode of flashModes) {
            this.elements[flashMode].length.htmlElement.addEventListener("change", event => {
                event.preventDefault()
                this.setLength(flashMode, Number(this.elements[flashMode].length.htmlElement.value))
            })
        }
    }

    setLength(flashMode: FlashMode, length: number): void {
        this.elements[flashMode].length.valueV1 = length
        if (checkboxes.fixNumberInterval.checked) {
            this.elements[flashMode].time.valueV1 = flashLengthAndTimeMemories[flashMode].expandTime(length)
        }
    }

    increaseLength(flashMode: FlashMode, diff: number): void {
        this.setLength(flashMode, this.elements[flashMode].length.valueV1 + diff)
    }
}

export const flashParamElementsManager = new FlashParamElementsManager(flashParamElements)
