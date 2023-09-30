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
                timeParam.disableElement()
                flashLengthAndTimeMemories[flashMode].save({ length: lengthParam.valueV1, time: timeParam.valueV1 })
            } else {
                timeParam.enableElement()
                flashLengthAndTimeMemories[flashMode].delete()
            }
        }
    })
}
