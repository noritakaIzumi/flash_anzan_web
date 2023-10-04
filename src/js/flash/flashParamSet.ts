import { type FlashDifficulty, type FlashDigit, type FlashMode } from '../globals.js'
import { currentFlashMode } from '../currentFlashMode.js'
import { changeShortcut } from '../shortcut/shortcut.js'
import { type ExecuteInterface } from '../interface/executeInterface.js'
import {
    flashParamElementsManagers,
    MultiplicationModeFlashParamElementsManager
} from './flashParamElementsManager.js'
import { flashParamElements } from '../dom/flashParamElements.js'
import { FlashLengthAndTimeMemory } from './flashLengthAndTimeMemory.js'

export function changeMode(mode: FlashMode): void {
    changeShortcut(mode)
    currentFlashMode.value = mode
    flashParamElementsManagers[mode].updateDifficultySupportStatus()
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
            digit: flashParamElementsManagers.addition.getValidatedDigit(),
            length: flashParamElementsManagers.addition.getValidatedLength(),
            time: flashParamElementsManagers.addition.getValidatedTime(),
            difficulty: flashParamElementsManagers.addition.getValidatedDifficulty(),
            offset: flashParamElementsManagers.addition.getValidatedOffset(),
        }
    }
}

export class MultiplicationModeGetFlashParamSetAdapter extends AbstractGetFlashParamSetAdapter<'multiplication'> {
    execute(): FlashParamSet<'multiplication'> {
        return {
            digit: [
                flashParamElementsManagers.multiplication.getValidatedDigit1(),
                flashParamElementsManagers.multiplication.getValidatedDigit2(),
            ],
            length: flashParamElementsManagers.multiplication.getValidatedLength(),
            time: flashParamElementsManagers.multiplication.getValidatedTime(),
            difficulty: flashParamElementsManagers.multiplication.getValidatedDifficulty(),
            offset: new MultiplicationModeFlashParamElementsManager({
                elements: flashParamElements.multiplication,
                commonElements: flashParamElements.common,
                flashLengthAndTimeMemory: new FlashLengthAndTimeMemory(),
            }).getValidatedOffset(),
        }
    }
}
