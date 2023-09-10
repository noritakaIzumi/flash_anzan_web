import {calculateComplexity} from "../src/js/flash_analysis"
import {ComplexityThresholdMap, FlashMode} from "../src/js/globals";
import {
    AdditionModeUnknownDifficultyCreateRawNumbersAdapter,
    MultiplicationModeUnknownDifficultyCreateRawNumbersAdapter
} from "../src/js/flash_numbers";

function getRank(numbers: number[], threshold: Threshold) {
    const half = (numbers.length / 2) | 0;
    const temp = numbers.sort();

    return {
        med: (temp[half - 1] + temp[half]) / 2,
        hard: temp[Math.ceil(numbers.length * (1 - threshold.hard))],
        easy: temp[Math.ceil(numbers.length * (1 - threshold.easy))],
    };
}

type Threshold = { hard: number, easy: number }

(() => {
    // main
    const complexityThresholdMap: ComplexityThresholdMap = {addition: {}, multiplication: {}};
    const sampleCount = 10000;
    const threshold: Threshold = {hard: 0.1, easy: 0.9};

    let mode: FlashMode = 'addition';
    for (let digitCount = 1; digitCount <= 14; ++digitCount) {
        for (let length = 2; length <= 30; ++length) {
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
    for (let digitCount1 = 1; digitCount1 <= 7; digitCount1++) {
        for (let digitCount2 = 1; digitCount2 <= 7; digitCount2++) {
            for (let length = 2; length <= 30; length++) {
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

    const path = require('path');
    const fs = require('fs');

    try {
        fs.writeFileSync(
            path.dirname(path.dirname(__filename)) + '/src/js/complexityThresholdMap.ts',
            `import{ComplexityThresholdMap}from"./globals";export const complexityThresholdMap:ComplexityThresholdMap=${JSON.stringify(complexityThresholdMap)};\n`);
        console.log('write end');
    } catch (e) {
        console.log(e);
    }
})();
