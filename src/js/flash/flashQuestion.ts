import {AdditionModeGetFlashParamSetAdapter, MultiplicationModeGetFlashParamSetAdapter} from "../flash_param_set";
import {
    AdditionModeCreateNewNumbersAdapter,
    AdditionModeEasyDifficultyComplexityIsValidAdapter,
    AdditionModeEasyDifficultyCreateRawNumbersAdapter,
    AdditionModeFlashNumbers,
    AdditionModeFlashGenerator, AdditionModeGetFlashAnswerAdapter,
    AdditionModeHardDifficultyComplexityIsValidAdapter,
    AdditionModeHardDifficultyCreateRawNumbersAdapter,
    AdditionModeNormalDifficultyComplexityIsValidAdapter,
    AdditionModeNormalDifficultyCreateRawNumbersAdapter,
    MultiplicationModeCreateNewNumbersAdapter, MultiplicationModeEasyDifficultyComplexityIsValidAdapter,
    MultiplicationModeEasyDifficultyCreateRawNumbersAdapter,
    MultiplicationModeFlashNumbers,
    MultiplicationModeFlashGenerator,
    MultiplicationModeHardDifficultyComplexityIsValidAdapter,
    MultiplicationModeHardDifficultyCreateRawNumbersAdapter, MultiplicationModeNormalDifficultyComplexityIsValidAdapter,
    MultiplicationModeNormalDifficultyCreateRawNumbersAdapter, MultiplicationModeGetFlashAnswerAdapter
} from "../flash_numbers";
import {complexityThresholdMap} from "../complexity_map";
import {AdditionModeFlashNumberHistory} from "../flashNumberHistory";

export class FlashQuestion {
}

export class AdditionModeFlashQuestion {
    create() {
        const paramSet = new AdditionModeGetFlashParamSetAdapter().execute()
        const flash = new AdditionModeFlashGenerator({
            createNewNumbersAdapter: new AdditionModeCreateNewNumbersAdapter({
                createRawNumbersAdapterMapByMode: {
                    easy: AdditionModeEasyDifficultyCreateRawNumbersAdapter,
                    normal: AdditionModeNormalDifficultyCreateRawNumbersAdapter,
                    hard: AdditionModeHardDifficultyCreateRawNumbersAdapter,
                },
                complexityIsValidAdapterMapByMode: {
                    easy: AdditionModeEasyDifficultyComplexityIsValidAdapter,
                    normal: AdditionModeNormalDifficultyComplexityIsValidAdapter,
                    hard: AdditionModeHardDifficultyComplexityIsValidAdapter,
                },
                complexityThresholdMapByMode: complexityThresholdMap.addition,
            }),
            flashNumbersClass: AdditionModeFlashNumbers,
            getFlashAnswerAdapter: AdditionModeGetFlashAnswerAdapter,
        }).execute(paramSet)
        const flashNumbers = flash.numbers
        const flashNumbersToDisplay = flashNumbers.toDisplay()
        const flashAnswer = flash.answer
        const flashAnswerToDisplay = flashAnswer.toDisplay()
        const flashNumberHistory = new AdditionModeFlashNumberHistory(paramSet.digit, flashNumbers.raw)
    }
}

export class MultiplicationModeFlashQuestion {
    create() {
        const paramSet = new MultiplicationModeGetFlashParamSetAdapter().execute()
        const flash = new MultiplicationModeFlashGenerator({
            createNewNumbersAdapter: new MultiplicationModeCreateNewNumbersAdapter({
                createRawNumbersAdapterMapByMode: {
                    easy: MultiplicationModeEasyDifficultyCreateRawNumbersAdapter,
                    normal: MultiplicationModeNormalDifficultyCreateRawNumbersAdapter,
                    hard: MultiplicationModeHardDifficultyCreateRawNumbersAdapter,
                },
                complexityIsValidAdapterMapByMode: {
                    easy: MultiplicationModeEasyDifficultyComplexityIsValidAdapter,
                    normal: MultiplicationModeNormalDifficultyComplexityIsValidAdapter,
                    hard: MultiplicationModeHardDifficultyComplexityIsValidAdapter,
                },
                complexityThresholdMapByMode: complexityThresholdMap.multiplication,
            }),
            flashNumbersClass: MultiplicationModeFlashNumbers,
            getFlashAnswerAdapter: MultiplicationModeGetFlashAnswerAdapter,
        }).execute(paramSet)
        const flashNumbers = flash.numbers
        const flashNumbersToDisplay = flashNumbers.toDisplay()
        const flashAnswer = flash.answer
        const flashAnswerToDisplay = flashAnswer.toDisplay()
    }
}
