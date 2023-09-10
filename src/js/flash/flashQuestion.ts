import {
    AdditionModeGetFlashParamSetAdapter,
    FlashParamSet,
    MultiplicationModeGetFlashParamSetAdapter
} from "../flash_param_set";
import {
    AdditionModeCreateNewNumbersAdapter,
    AdditionModeFlashGenerator,
    AdditionModeFlashNumbers,
    AdditionModeGetFlashAnswerAdapter,
    complexityIsValidAdapterMap,
    createRawNumbersAdapterMap,
    FlashAnswer,
    FlashNumbers,
    MultiplicationModeCreateNewNumbersAdapter,
    MultiplicationModeFlashGenerator,
    MultiplicationModeFlashNumbers,
    MultiplicationModeGetFlashAnswerAdapter
} from "../flash_numbers";
import {complexityThresholdMap} from "../complexityThresholdMap";
import {flashNumberHistoryRegistry} from "../flashNumberHistory";
import {FlashDigit, FlashMode} from "../globals";

export type FlashOption = {
    repeat?: boolean,
}

export abstract class FlashQuestion<T extends FlashMode> {
    abstract create(option: FlashOption): { paramSet: FlashParamSet<T>, flash: { numbers: FlashNumbers<FlashDigit[T]>, answer: FlashAnswer } }
}

export class AdditionModeFlashQuestion extends FlashQuestion<"addition"> {
    create(option: FlashOption) {
        const paramSet = new AdditionModeGetFlashParamSetAdapter().execute()
        const flash = new AdditionModeFlashGenerator({
            createNewNumbersAdapter: new AdditionModeCreateNewNumbersAdapter({
                createRawNumbersAdapterMapByMode: createRawNumbersAdapterMap.addition,
                complexityIsValidAdapterMapByMode: complexityIsValidAdapterMap.addition,
                complexityThresholdMapByMode: complexityThresholdMap.addition,
            }),
            flashNumbersClass: AdditionModeFlashNumbers,
            getFlashAnswerAdapter: AdditionModeGetFlashAnswerAdapter,
        }).execute(paramSet, option)

        flashNumberHistoryRegistry.register("addition", paramSet.digit, flash.numbers.raw)

        return {paramSet, flash}
    }
}

export class MultiplicationModeFlashQuestion extends FlashQuestion<"multiplication"> {
    create(option: FlashOption) {
        const paramSet = new MultiplicationModeGetFlashParamSetAdapter().execute()
        const flash = new MultiplicationModeFlashGenerator({
            createNewNumbersAdapter: new MultiplicationModeCreateNewNumbersAdapter({
                createRawNumbersAdapterMapByMode: createRawNumbersAdapterMap.multiplication,
                complexityIsValidAdapterMapByMode: complexityIsValidAdapterMap.multiplication,
                complexityThresholdMapByMode: complexityThresholdMap.multiplication,
            }),
            flashNumbersClass: MultiplicationModeFlashNumbers,
            getFlashAnswerAdapter: MultiplicationModeGetFlashAnswerAdapter,
        }).execute(paramSet, option)

        flashNumberHistoryRegistry.register("multiplication", paramSet.digit, flash.numbers.raw)

        return {paramSet, flash}
    }
}

const flashQuestion: { [mode in FlashMode]: { new(): FlashQuestion<mode> } } = {
    addition: AdditionModeFlashQuestion,
    multiplication: MultiplicationModeFlashQuestion,
}

export class FlashQuestionCreator {
    public static create(flashMode: FlashMode, option: FlashOption) {
        return new flashQuestion[flashMode]().create(option)
    }
}
