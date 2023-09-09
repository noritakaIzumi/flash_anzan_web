import {Abacus} from "./abacus";
import {getCalculateComplexity} from "./flash_analysis";
import {complexityMap} from "./complexity_map";
import {difficultyMap, FlashDifficulty, FlashMode, generateNumbersRetryLimit} from "./globals";

function getRandomDigit(excepts = []) {
    const d = [];
    for (let i = 0; i < 10; i++) {
        if (excepts.indexOf(i) >= 0) {
            continue;
        }
        d.push(i);
    }
    return d[Math.floor(Math.random() * d.length)];
}

function getRandomInt(digitCount: number, previousNum: number = null, digitAllDifferent: boolean = false): number {
    const previousNumDigits = previousNum === null
        ? Array.from({length: digitCount}, () => null)
        : String(previousNum).split('').reverse().map((n) => {
            return Number(n);
        });
    let digits = [getRandomDigit([0].concat(previousNumDigits.slice(-1)))];
    let i = 0;
    while (i < digitCount - 1) {
        let digit = null;
        if (digitCount <= 9 && digitAllDifferent) {
            digit = getRandomDigit(digits.concat(previousNumDigits[i]));
        } else {
            digit = getRandomDigit([previousNumDigits[i]]);
        }
        digits.push(digit);
        i++;
    }
    return Number(String(digits[0]) + digits.slice(1).reverse().join(''));
}

/**
 * 出題数字を作成する。
 */
export function generateNumbers(digitCount: number | number[], length: number, difficulty: FlashDifficulty, mode: FlashMode) {
    if (mode === 'addition') {
        return generateNumbersAdditionMode(digitCount as number, length, difficulty)
    }
    if (mode === 'multiplication') {
        return generateNumbersMultiplicationMode(digitCount as number[], length, difficulty)
    }
}

export function generateNumbersMultiplicationMode(digitCount: number[], length: number, difficulty: FlashDifficulty): number[][] {
    let retry = 0;
    while (retry < generateNumbersRetryLimit) {
        const [numbers, carries] = (() => {
            // そろばん
            let abacus = new Abacus(0);
            // 出題数字
            let numbers: number[][] = [];
            // 繰り上がり回数
            let carries: number[] = [];

            for (let i = 0; i < length; i++) {
                const number1 = getRandomInt(digitCount[0], numbers.length > 0 ? numbers.slice(-1)[0][0] : null, true);
                const number2 = getRandomInt(digitCount[1], numbers.length > 0 ? numbers.slice(-1)[0][1] : null, true);
                const digits1 = String(number1).split('').reverse().map((n) => {
                    return Number(n);
                });
                const digits2 = String(number2).split('').reverse().map((n) => {
                    return Number(n);
                });
                for (let p1 = digits1.length - 1; p1 >= 0; p1--) {
                    for (let p2 = digits2.length - 1; p2 >= 0; p2--) {
                        abacus.add(digits1[p1] * digits2[p2] * Math.pow(10, p1 + p2));
                    }
                }
                numbers.push([number1, number2]);
                carries.push(abacus.carry);
                abacus = new Abacus(abacus.value);
            }

            return [numbers, carries]
        })();

        const complexity = getCalculateComplexity(carries, digitCount[0] * digitCount[1]);
        const complexityMapKey = `${digitCount[0]}-${digitCount[1]}-${length}`;

        const condition = (() => {
            if (difficulty === difficultyMap.easy) {
                return complexityMap.multiplication[complexityMapKey][difficulty] <= 0 && complexity <= 0 // 1 桁 × 1 桁 2 口 easy の閾値が 0 であることへの対応
                    || complexity < complexityMap.multiplication[complexityMapKey][difficulty];
            }
            if (difficulty === difficultyMap.normal) {
                return complexity >= complexityMap.multiplication[complexityMapKey][difficultyMap.easy]
                    && complexity < complexityMap.multiplication[complexityMapKey][difficultyMap.hard];
            }
            if (difficulty === difficultyMap.hard) {
                return complexity >= complexityMap.multiplication[complexityMapKey][difficulty];
            }
        })();

        if (condition) {
            return numbers;
        }

        retry++;
    }

    throw new Error('failed to generate numbers');
}

export function generateNumbersAdditionMode(digitCount: number, length: number, difficulty: FlashDifficulty): number[] {
    let retry = 0;
    while (retry < generateNumbersRetryLimit) {
        // そろばん
        let abacus = new Abacus(0);
        // 出題数字
        let numbers: number[] = [];
        // 繰り上がり回数
        let carries: number[] = [];

        if (difficulty === 'easy') {
            let tempAbacusValue: number;
            for (let i = 0; i < length; i++) {
                let getIntRetry = 0;
                let bestNumber: number;
                let bestCarry = -1;
                while (true) {
                    const number = getRandomInt(digitCount, numbers.slice(-1)[0] || null, true);

                    tempAbacusValue = abacus.value;
                    abacus = new Abacus(abacus.value).add(number);

                    if (abacus.carry > digitCount) {
                        if (abacus.carry > bestCarry) {
                            bestNumber = number;
                            bestCarry = abacus.carry;
                        }

                        abacus = new Abacus(tempAbacusValue);

                        if (getIntRetry < 100) {
                            getIntRetry++;
                            continue;
                        }

                        abacus = abacus.add(bestNumber);
                        numbers.push(bestNumber);
                        carries.push(abacus.carry);
                        break;
                    }

                    numbers.push(number);
                    carries.push(abacus.carry);
                    break;
                }
            }
        }
        if (difficulty === 'normal') {
            for (let i = 0; i < length; i++) {
                const number = getRandomInt(digitCount, numbers.slice(-1)[0] || null, true);
                abacus = new Abacus(abacus.value).add(number);
                numbers.push(number);
                carries.push(abacus.carry);
            }
        }
        if (difficulty === 'hard') {
            let tempAbacusValue: number;
            for (let i = 0; i < length; i++) {
                let getIntRetry = 0;
                let bestNumber: number;
                let bestCarry = -1;
                while (true) {
                    const number = getRandomInt(digitCount, numbers.slice(-1)[0] || null, false);

                    tempAbacusValue = abacus.value;
                    abacus = new Abacus(abacus.value).add(number);

                    if (i >= 1 && abacus.carry < digitCount) {
                        if (abacus.carry > bestCarry) {
                            bestNumber = number;
                            bestCarry = abacus.carry;
                        }

                        abacus = new Abacus(tempAbacusValue);

                        if (getIntRetry < 100) {
                            getIntRetry++;
                            continue;
                        }

                        abacus = abacus.add(bestNumber);
                        numbers.push(bestNumber);
                        carries.push(abacus.carry);
                        break;
                    }

                    numbers.push(number);
                    carries.push(abacus.carry);
                    break;
                }
            }
        }

        const complexity = getCalculateComplexity(carries.slice(1), digitCount);
        const complexityMapKey = `${digitCount}-${length}`;

        const condition = (() => {
            if (difficulty === 'easy') {
                return complexityMap.addition[complexityMapKey][difficulty] <= 0 && complexity <= 0 // 1 桁 2 口 easy の閾値が 0 であることへの対応
                    || complexity < complexityMap.addition[complexityMapKey][difficulty];
            }
            if (difficulty === 'normal') {
                return complexity >= complexityMap.addition[complexityMapKey][difficultyMap.easy]
                    && complexity < complexityMap.addition[complexityMapKey][difficultyMap.hard];
            }
            if (difficulty === 'hard') {
                return complexity >= complexityMap.addition[complexityMapKey][difficulty];
            }
        })();

        if (condition) {
            return numbers;
        }

        retry++;
    }

    throw new Error('failed to generate numbers');
}

export class FlashAnswer {
    private readonly _value: number;

    /**
     * @param {number} answer
     */
    constructor(answer: number) {
        this._value = answer
    }

    toNumber() {
        return this._value
    }

    toDisplay() {
        return this._value.toLocaleString()
    }
}
