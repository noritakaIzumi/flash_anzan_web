import { type FlashDifficulty, type FlashDigit, type FlashMode } from '../globals.js'
import { currentFlashMode } from '../currentFlashMode.js'
import { changeShortcut } from '../shortcut/shortcut.js'
import { type ExecuteInterface } from '../interface/executeInterface.js'
import {
    additionModeFlashParamElementsManager,
    multiplicationModeFlashParamElementsManager
} from './flashParamElementsManager.js'

export function changeMode(mode: FlashMode): void {
    changeShortcut(mode)
    currentFlashMode.value = mode
}

export interface FlashParamSet<T extends FlashMode> {
    digit: FlashDigit[T]
    length: number
    time: number
    difficulty: FlashDifficulty
    offset: number
}

export abstract class AbstractGetFlashParamSetAdapter<T extends FlashMode> implements ExecuteInterface {
    abstract execute(): FlashParamSet<T>
}

export class AdditionModeGetFlashParamSetAdapter extends AbstractGetFlashParamSetAdapter<'addition'> {
    execute(): FlashParamSet<'addition'> {
        return {
            digit: additionModeFlashParamElementsManager.getValidatedDigit(),
            length: additionModeFlashParamElementsManager.getValidatedLength(),
            time: additionModeFlashParamElementsManager.getValidatedTime(),
            difficulty: additionModeFlashParamElementsManager.getValidatedDifficulty(),
            offset: additionModeFlashParamElementsManager.getValidatedOffset(),
        }
    }
}

export class MultiplicationModeGetFlashParamSetAdapter extends AbstractGetFlashParamSetAdapter<'multiplication'> {
    execute(): FlashParamSet<'multiplication'> {
        return {
            digit: [
                multiplicationModeFlashParamElementsManager.getValidatedDigit1(),
                multiplicationModeFlashParamElementsManager.getValidatedDigit2(),
            ],
            length: multiplicationModeFlashParamElementsManager.getValidatedLength(),
            time: multiplicationModeFlashParamElementsManager.getValidatedTime(),
            difficulty: multiplicationModeFlashParamElementsManager.getValidatedDifficulty(),
            offset: multiplicationModeFlashParamElementsManager.getValidatedOffset(),
        }
    }
}
