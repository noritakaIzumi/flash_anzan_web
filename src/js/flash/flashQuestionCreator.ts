import {
    AdditionModeGetFlashParamSetAdapter,
    type FlashParamSet,
    MultiplicationModeGetFlashParamSetAdapter
} from "./flashParamSet.js"
import {
    AdditionModeCreateNewNumbersAdapter,
    AdditionModeFlashGenerator,
    AdditionModeFlashNumbers,
    AdditionModeGetFlashAnswerAdapter,
    complexityIsValidAdapterMap,
    createRawNumbersAdapterMap,
    type Flash,
    getAdditionModeComplexityThresholdMapKey,
    getMultiplicationModeComplexityThresholdMapKey,
    MultiplicationModeCreateNewNumbersAdapter,
    MultiplicationModeFlashGenerator,
    MultiplicationModeFlashNumbers,
    MultiplicationModeGetFlashAnswerAdapter
} from "./flashNumbers.js"
import { complexityThresholdMap } from "../lib/complexityThresholdMap.js"
import { flashNumberHistoryRegistry } from "./flashNumberHistory.js"
import { type FlashMode } from "../globals.js"
import { flashParamSchema } from "../../config/flashParamSchema.js"

export interface FlashOptions {
    repeat?: boolean
    allowUnknownDifficulty?: boolean
}

export abstract class FlashQuestionCreator<T extends FlashMode> {
    protected paramSet: FlashParamSet<T>

    constructor() {
        this.paramSet = this.getParamSet()
    }

    protected abstract getParamSet(): FlashParamSet<T>

    abstract difficultyIsSupported(): boolean

    abstract create(option: FlashOptions): FlashQuestion<T>
}

interface FlashQuestion<T extends FlashMode> {
    paramSet: FlashParamSet<T>
    flash: Flash<T>
}

export class AdditionModeFlashQuestionCreator extends FlashQuestionCreator<"addition"> {
    protected getParamSet(): FlashParamSet<"addition"> {
        return new AdditionModeGetFlashParamSetAdapter().execute()
    }

    difficultyIsSupported(): boolean {
        const complexityThresholdMapKey = getAdditionModeComplexityThresholdMapKey(this.paramSet.digit, flashParamSchema.addition.length.difficultySupportMax)
        return complexityThresholdMapKey in complexityThresholdMap.addition
    }

    create(option: FlashOptions): FlashQuestion<"addition"> {
        const flash = new AdditionModeFlashGenerator({
            createNewNumbersAdapter: new AdditionModeCreateNewNumbersAdapter({
                createRawNumbersAdapterMapByMode: createRawNumbersAdapterMap.addition,
                complexityIsValidAdapterMapByMode: complexityIsValidAdapterMap.addition,
                complexityThresholdMapByMode: complexityThresholdMap.addition,
                difficultySupportMaxLength: flashParamSchema.addition.length.difficultySupportMax,
            }),
            flashNumbersClass: AdditionModeFlashNumbers,
            getFlashAnswerAdapter: AdditionModeGetFlashAnswerAdapter,
        }).execute(this.paramSet, option)

        flashNumberHistoryRegistry.addition.register(this.paramSet.digit, flash.numbers, flash.answer)

        return {
            paramSet: this.paramSet,
            flash,
        }
    }
}

export class MultiplicationModeFlashQuestionCreator extends FlashQuestionCreator<"multiplication"> {
    protected getParamSet(): FlashParamSet<"multiplication"> {
        return new MultiplicationModeGetFlashParamSetAdapter().execute()
    }

    difficultyIsSupported(): boolean {
        const complexityThresholdMapKey = getMultiplicationModeComplexityThresholdMapKey(this.paramSet.digit, flashParamSchema.multiplication.length.difficultySupportMax)
        return complexityThresholdMapKey in complexityThresholdMap.multiplication
    }

    create(option: FlashOptions): FlashQuestion<"multiplication"> {
        const flash = new MultiplicationModeFlashGenerator({
            createNewNumbersAdapter: new MultiplicationModeCreateNewNumbersAdapter({
                createRawNumbersAdapterMapByMode: createRawNumbersAdapterMap.multiplication,
                complexityIsValidAdapterMapByMode: complexityIsValidAdapterMap.multiplication,
                complexityThresholdMapByMode: complexityThresholdMap.multiplication,
                difficultySupportMaxLength: flashParamSchema.multiplication.length.difficultySupportMax,
            }),
            flashNumbersClass: MultiplicationModeFlashNumbers,
            getFlashAnswerAdapter: MultiplicationModeGetFlashAnswerAdapter,
        }).execute(this.paramSet, option)

        flashNumberHistoryRegistry.multiplication.register(this.paramSet.digit, flash.numbers, flash.answer)

        return {
            paramSet: this.paramSet,
            flash,
        }
    }
}

const flashQuestion: { [mode in FlashMode]: new() => FlashQuestionCreator<mode> } = {
    addition: AdditionModeFlashQuestionCreator,
    multiplication: MultiplicationModeFlashQuestionCreator,
}

export function getFlashQuestionCreator<T extends FlashMode>(flashMode: T): FlashQuestionCreator<T> {
    return new flashQuestion[flashMode]()
}
