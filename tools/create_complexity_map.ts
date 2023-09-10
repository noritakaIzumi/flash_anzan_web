import {Abacus} from "../src/js/abacus";
import {getCalculateComplexity} from "../src/js/flash_analysis"
import {ComplexitySchema} from "../src/js/globals";

function generateCarries(digitCount: number | number[], length: number, mode: Mode) {
    function getRandomInt(digitCount: number) {
        const max = Math.pow(10, digitCount) - 1;
        const min = Math.pow(10, digitCount - 1);
        return Math.floor(Math.random() * (max - min + 1) + min);
    }

    switch (mode) {
        case 'multiplication': {
            const _digitCount = digitCount as number[];
            let abacus = new Abacus();
            let carries = [];
            for (let i = 0; i < length; i++) {
                const digits1 = String(getRandomInt(_digitCount[0])).split('').reverse().map((n) => {
                    return Number(n);
                });
                const digits2 = String(getRandomInt(_digitCount[1])).split('').reverse().map((n) => {
                    return Number(n);
                });
                for (let p1 = digits1.length - 1; p1 >= 0; p1--) {
                    for (let p2 = digits2.length - 1; p2 >= 0; p2--) {
                        abacus.add(digits1[p1] * digits2[p2] * Math.pow(10, p1 + p2));
                    }
                }
                carries.push(abacus.carry);
                abacus = new Abacus(abacus.value);
            }
            return carries;
        }
        case 'addition': {
            const _digitCount = digitCount as number;
            let abacus = new Abacus();
            let carries = [];
            for (let i = 0; i < length; i++) {
                const number = getRandomInt(_digitCount);
                abacus = new Abacus(abacus.value).add(number);
                carries.push(abacus.carry);
            }
            return carries;
        }
        default:
    }
}

function getRank(numbers: number[], threshold: Threshold) {
    const half = (numbers.length / 2) | 0;
    const temp = numbers.sort();

    return {
        med: (temp[half - 1] + temp[half]) / 2,
        hard: temp[Math.ceil(numbers.length * (1 - threshold.hard))],
        easy: temp[Math.ceil(numbers.length * (1 - threshold.easy))],
    };
}

function generateComplexity(digitCount: number | number[], length: number, mode: Mode, sampleCount: number, threshold: Threshold) {
    const complexities: number[] = [];
    for (let _ = 0; _ < sampleCount; _++) {
        const carries = generateCarries(digitCount, length, mode);
        const complexity = getCalculateComplexity(carries, typeof digitCount === 'object' ? digitCount[0] * digitCount[1] : digitCount);
        complexities.push(complexity);
    }

    return getRank(complexities, threshold);
}

type Threshold = { hard: number, easy: number }
type Mode = 'addition' | 'multiplication'

(() => {
    // main
    const result = {addition: {}, multiplication: {}};
    const sampleCount = 10000;
    const threshold: Threshold = {hard: 0.1, easy: 0.9};

    let mode: Mode = 'addition';
    for (let digitCount = 1; digitCount <= 14; ++digitCount) {
        for (let length = 2; length <= 30; ++length) {
            result.addition[`${digitCount}-${length}`] = generateComplexity(digitCount, length, mode, sampleCount, threshold);
            console.log(`${mode} ${digitCount} 桁 ${length} 口: completed`);
        }
    }

    mode = 'multiplication';
    for (let digitCount1 = 1; digitCount1 <= 7; digitCount1++) {
        for (let digitCount2 = 1; digitCount2 <= 7; digitCount2++) {
            for (let length = 2; length <= 30; length++) {
                const digitCount = [digitCount1, digitCount2];
                result.multiplication[`${digitCount1}-${digitCount2}-${length}`] = generateComplexity(digitCount, length, mode, sampleCount, threshold);
                console.log(`${mode} ${digitCount1} 桁× ${digitCount2} 桁 ${length} 口: completed`);
            }
        }
    }

    const path = require('path');
    const fs = require('fs');

    try {
        fs.writeFileSync(
            path.dirname(path.dirname(__filename)) + '/src/js/complexity_map.ts',
            `import{ComplexitySchema}from"./globals";export const complexityMap:{addition:{[key:\`\${number}-\${number}\`]:ComplexitySchema},multiplication:{[key:\`\${number}-\${number}-\${number}\`]:ComplexitySchema}}=${JSON.stringify(result)};\n`);
        console.log('write end');
    } catch (e) {
        console.log(e);
    }
})();
