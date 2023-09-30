import { checkboxes } from "../dom/htmlElement.js"
import { flashModes } from "../globals.js"
import { flashParamElements } from "../dom/flashParamElements.js"
import { flashLengthAndTimeMemories } from "./flashLengthAndTimeMemory.js"

export function initFixNumberInterval(): void {
    // 表示間隔を固定するオプション
    checkboxes.fixNumberInterval.addEventListener("change", () => {
        for (const flashMode of flashModes) {
            const lengthParam = flashParamElements[flashMode].length
            const timeParam = flashParamElements[flashMode].time
            if (checkboxes.fixNumberInterval.checked) {
                flashLengthAndTimeMemories[flashMode].save({ length: lengthParam.valueV1, time: timeParam.valueV1 })
            } else {
                flashLengthAndTimeMemories[flashMode].delete()
            }
        }
    })
    for (const flashMode of flashModes) {
        flashParamElements[flashMode].length.htmlElement.addEventListener("change", () => {
            if (checkboxes.fixNumberInterval.checked) {
                const length = flashParamElements[flashMode].length.valueV1
                flashParamElements[flashMode].time.valueV1 = flashLengthAndTimeMemories[flashMode].expandTime(length)
            }
        })
    }
}
