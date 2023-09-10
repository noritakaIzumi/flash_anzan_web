import {calculateComplexity} from "../src/js/flash/flashAnalysis.js"
import {ComplexityThresholdMap, FlashMode} from "../src/js/globals.js";
import {
    AdditionModeUnknownDifficultyCreateRawNumbersAdapter,
    MultiplicationModeUnknownDifficultyCreateRawNumbersAdapter
} from "../src/js/flash/flashNumbers.js";
import * as fs from "fs";
import * as path from "path";
import {fileURLToPath} from 'url';
import {flashParamSchema} from "../src/js/flash/flashParamSchema.js";

function getRank(numbers: number[], threshold: Threshold) {
    const half = (numbers.length / 2) | 0;
    const temp = numbers.sort();

    return {
        med: (temp[half - 1] + temp[half]) / 2,
        hard: temp[Math.ceil(numbers.length * (1 - threshold.hard))],
        easy: temp[Math.ceil(numbers.length * (1 - threshold.easy))],
    };
}

type Threshold = {
    hard: number,
    easy: number
}

(() => {
    // main
    const complexityThresholdMap: ComplexityThresholdMap = {addition: {}, multiplication: {}};
    const sampleCount = 10000;
    const threshold: Threshold = {hard: 0.1, easy: 0.9};

    let mode: FlashMode = 'addition';
    const additionModeParamSchema = flashParamSchema.addition
    for (let digitCount = additionModeParamSchema.digit.min; digitCount <= additionModeParamSchema.digit.difficultySupportMax; ++digitCount) {
        for (let length = additionModeParamSchema.length.min; length <= additionModeParamSchema.length.difficultySupportMax; ++length) {
            const complexities: number[] = []
            for (let _ = 0; _ < sampleCount; _++) {
                const rawNumbers = new AdditionModeUnknownDifficultyCreateRawNumbersAdapter().execute(digitCount, length)
                const complexity = calculateComplexity(rawNumbers.carries, digitCount);
                complexities.push(complexity)
            }
            complexityThresholdMap.addition[`${digitCount}-${length}`] = getRank(complexities, threshold);
            console.log(`${mode} ${digitCount} 桁 ${length} 口: completed`);
        }
    }

    mode = 'multiplication';
    const multiplicationModeParamSchema = flashParamSchema.multiplication
    for (let digitCount1 = multiplicationModeParamSchema.digit1.min; digitCount1 <= multiplicationModeParamSchema.digit1.difficultySupportMax; digitCount1++) {
        for (let digitCount2 = multiplicationModeParamSchema.digit2.min; digitCount2 <= multiplicationModeParamSchema.digit2.difficultySupportMax; digitCount2++) {
            for (let length = multiplicationModeParamSchema.length.min; length <= multiplicationModeParamSchema.length.difficultySupportMax; length++) {
                const digitFlippedComplexityThreshold = complexityThresholdMap.multiplication[`${digitCount2}-${digitCount1}-${length}`];
                if (digitFlippedComplexityThreshold) {
                    complexityThresholdMap.multiplication[`${digitCount1}-${digitCount2}-${length}`] = digitFlippedComplexityThreshold;
                    console.log(`${mode} ${digitCount1} 桁× ${digitCount2} 桁 ${length} 口: ${digitCount2} 桁× ${digitCount1} 桁 ${length} 口 から copy`);
                    continue;
                }
                const complexities: number[] = []
                for (let _ = 0; _ < sampleCount; _++) {
                    const rawNumbers = new MultiplicationModeUnknownDifficultyCreateRawNumbersAdapter().execute([digitCount1, digitCount2], length)
                    const complexity = calculateComplexity(rawNumbers.carries, digitCount1 * digitCount2);
                    complexities.push(complexity)
                }
                complexityThresholdMap.multiplication[`${digitCount1}-${digitCount2}-${length}`] = getRank(complexities, threshold);
                console.log(`${mode} ${digitCount1} 桁× ${digitCount2} 桁 ${length} 口: completed`);
            }
        }
    }

    try {
        const __filename = fileURLToPath(import.meta.url)
        fs.writeFileSync(
            path.dirname(path.dirname(__filename)) + '/src/js/lib/complexityThresholdMap.ts',
            `import{ComplexityThresholdMap}from"../globals.js";export const complexityThresholdMap:ComplexityThresholdMap=${JSON.stringify(complexityThresholdMap)};\n`);
        console.log('write end');
    } catch (e) {
        console.log(e);
    }
})();
