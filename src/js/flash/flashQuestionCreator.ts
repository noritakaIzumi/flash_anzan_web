import {
    AdditionModeGetFlashParamSetAdapter,
    FlashParamSet,
    MultiplicationModeGetFlashParamSetAdapter
} from "./flashParamSet.js";
import {
    AdditionModeCreateNewNumbersAdapter,
    AdditionModeFlashGenerator,
    AdditionModeFlashNumbers,
    AdditionModeGetFlashAnswerAdapter,
    complexityIsValidAdapterMap,
    createRawNumbersAdapterMap,
    FlashAnswer,
    FlashNumbers,
    getAdditionModeComplexityThresholdMapKey,
    getMultiplicationModeComplexityThresholdMapKey,
    MultiplicationModeCreateNewNumbersAdapter,
    MultiplicationModeFlashGenerator,
    MultiplicationModeFlashNumbers,
    MultiplicationModeGetFlashAnswerAdapter
} from "./flashNumbers.js";
import {complexityThresholdMap} from "../lib/complexityThresholdMap.js";
import {flashNumberHistoryRegistry} from "./flashNumberHistory.js";
import {FlashDigit, FlashMode} from "../globals.js";

export type FlashOptions = {
    repeat?: boolean,
    allowUnknownDifficulty?: boolean,
}

export abstract class FlashQuestionCreator<T extends FlashMode> {
    protected paramSet: FlashParamSet<T>;

    constructor() {
        this.paramSet = this.getParamSet()
    }

    protected abstract getParamSet(): FlashParamSet<T>

    abstract difficultyIsSupported(): boolean;

    abstract create(option: FlashOptions): {
        paramSet: FlashParamSet<T>,
        flash: {
            numbers: FlashNumbers<FlashDigit[T]>,
            answer: FlashAnswer
        }
    }
}

export class AdditionModeFlashQuestionCreator extends FlashQuestionCreator<"addition"> {
    protected getParamSet(): FlashParamSet<"addition"> {
        return new AdditionModeGetFlashParamSetAdapter().execute();
    }

    difficultyIsSupported(): boolean {
        const complexityThresholdMapKey = getAdditionModeComplexityThresholdMapKey(this.paramSet.digit, this.paramSet.length)
        return complexityThresholdMapKey in complexityThresholdMap.addition
    }

    create(option: FlashOptions) {
        const flash = new AdditionModeFlashGenerator({
            createNewNumbersAdapter: new AdditionModeCreateNewNumbersAdapter({
                createRawNumbersAdapterMapByMode: createRawNumbersAdapterMap.addition,
                complexityIsValidAdapterMapByMode: complexityIsValidAdapterMap.addition,
                complexityThresholdMapByMode: complexityThresholdMap.addition,
            }),
            flashNumbersClass: AdditionModeFlashNumbers,
            getFlashAnswerAdapter: AdditionModeGetFlashAnswerAdapter,
        }).execute(this.paramSet, option)

        flashNumberHistoryRegistry.addition.register(this.paramSet.digit, flash.numbers, flash.answer)

        return {paramSet: this.paramSet, flash}
    }
}

export class MultiplicationModeFlashQuestionCreator extends FlashQuestionCreator<"multiplication"> {
    protected getParamSet(): FlashParamSet<"multiplication"> {
        return new MultiplicationModeGetFlashParamSetAdapter().execute();
    }

    difficultyIsSupported(): boolean {
        const complexityThresholdMapKey = getMultiplicationModeComplexityThresholdMapKey(this.paramSet.digit, this.paramSet.length)
        return complexityThresholdMapKey in complexityThresholdMap.multiplication
    }

    create(option: FlashOptions) {
        const flash = new MultiplicationModeFlashGenerator({
            createNewNumbersAdapter: new MultiplicationModeCreateNewNumbersAdapter({
                createRawNumbersAdapterMapByMode: createRawNumbersAdapterMap.multiplication,
                complexityIsValidAdapterMapByMode: complexityIsValidAdapterMap.multiplication,
                complexityThresholdMapByMode: complexityThresholdMap.multiplication,
            }),
            flashNumbersClass: MultiplicationModeFlashNumbers,
            getFlashAnswerAdapter: MultiplicationModeGetFlashAnswerAdapter,
        }).execute(this.paramSet, option)

        flashNumberHistoryRegistry.multiplication.register(this.paramSet.digit, flash.numbers, flash.answer)

        return {paramSet: this.paramSet, flash}
    }
}

const flashQuestion: { [mode in FlashMode]: { new(): FlashQuestionCreator<mode> } } = {
    addition: AdditionModeFlashQuestionCreator,
    multiplication: MultiplicationModeFlashQuestionCreator,
}

export class FlashQuestionCreatorFactory {
    public static getInstance(flashMode: FlashMode) {
        return new flashQuestion[flashMode]()
    }
}
