import {type FlashDifficulty, type FlashDigit, type FlashMode} from '../globals.js'
import {currentFlashMode} from '../currentFlashMode.js'
import {changeShortcut} from '../shortcut/shortcut.js'
import {type ExecuteInterface} from '../interface/executeInterface.js'
import {flashParamElements} from '../dom/flashParamElements.js'

export function changeMode(mode: FlashMode) {
    changeShortcut(mode)
    currentFlashMode.value = mode
}

export interface FlashParam<TDigit> {
    digit: TDigit
    length: number
    time: number
    difficulty: FlashDifficulty
    flashRate: number
    offset: number
}

export interface FlashParamSet<T extends FlashMode> {
    digit: FlashDigit[T]
    length: number
    time: number
    difficulty: FlashDifficulty
    flashRate: number
    offset: number
}

export abstract class AbstractGetFlashParamSetAdapter<T extends FlashMode> implements ExecuteInterface {
    abstract execute(): FlashParamSet<T>
}

export class AdditionModeGetFlashParamSetAdapter extends AbstractGetFlashParamSetAdapter<'addition'> {
    execute(): FlashParamSet<'addition'> {
        return {
            digit: flashParamElements.addition.digit.updateParam().valueV1,
            length: flashParamElements.addition.length.updateParam().valueV1,
            time: flashParamElements.addition.time.updateParam().valueV1,
            difficulty: flashParamElements.common.difficulty.valueV1,
            flashRate: flashParamElements.common.flashRate.updateParam().valueV1,
            offset: flashParamElements.common.offset.updateParam().valueV1
        }
    }
}

export class MultiplicationModeGetFlashParamSetAdapter extends AbstractGetFlashParamSetAdapter<'multiplication'> {
    execute(): FlashParamSet<'multiplication'> {
        return {
            digit: [
                flashParamElements.multiplication.digit1.updateParam().valueV1,
                flashParamElements.multiplication.digit2.updateParam().valueV1
            ],
            length: flashParamElements.multiplication.length.updateParam().valueV1,
            time: flashParamElements.multiplication.time.updateParam().valueV1,
            difficulty: flashParamElements.common.difficulty.valueV1,
            flashRate: flashParamElements.common.flashRate.updateParam().valueV1,
            offset: flashParamElements.common.offset.updateParam().valueV1
        }
    }
}
