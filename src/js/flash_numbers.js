import {Abacus} from "./abacus";
import {getCalculateComplexity} from "./flash_analysis";
import {complexityMap} from "./complexity_map";
import {difficultyMap, generateNumbersRetryLimit, modeNames} from "./globals";

/**
 * 出題数字を作成する。
 * @param {number|number[]} digitCount 桁数
 * @param {number} length 口数
 * @param {string} difficulty 難易度
 * @param {string} mode モード
 * @returns {number[]}
 */
export function generateNumbers(digitCount, length, difficulty, mode) {
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

    function getRandomInt(digitCount, previousNum = null, digitAllDifferent = false) {
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

    let retry = 0;
    while (retry < generateNumbersRetryLimit) {
        // そろばん
        let abacus = new Abacus(0);
        // 出題数字
        let numbers = [];
        // 繰り上がり回数
        let carries = [];

        switch (mode) {
            case modeNames.multiplication: {
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

                const complexityMapKey = `${digitCount[0]}-${digitCount[1]}-${length}`;
                const complexity = getCalculateComplexity(carries, digitCount[0] * digitCount[1]);
                switch (difficulty) {
                    case difficultyMap.easy:
                        // 1 桁 × 1 桁 2 口 easy の閾値が 0 であることへの対応
                        if (
                            complexityMap.multiplication[complexityMapKey][difficulty] <= 0
                            && complexity <= 0
                        ) {
                            return numbers;
                        }
                        if (complexity < complexityMap.multiplication[complexityMapKey][difficulty]) {
                            return numbers;
                        }
                        break;
                    case difficultyMap.normal:
                        if (complexity >= complexityMap.multiplication[complexityMapKey][difficultyMap.easy]
                            && complexity < complexityMap.multiplication[complexityMapKey][difficultyMap.hard]) {
                            return numbers;
                        }
                        break;
                    case difficultyMap.hard:
                        if (complexity >= complexityMap.multiplication[complexityMapKey][difficulty]) {
                            return numbers;
                        }
                        break;
                    default:
                        throw new RangeError('invalid difficulty');
                }

                break;
            }
            case modeNames.addition:
                const complexityMapKey = `${digitCount}-${length}`;
                switch (difficulty) {
                    case difficultyMap.easy: {
                        let tempAbacusValue;
                        for (let i = 0; i < length; i++) {
                            while (true) {
                                const number = getRandomInt(digitCount, numbers.slice(-1)[0] || null, true);

                                tempAbacusValue = abacus.value;
                                abacus = new Abacus(abacus.value).add(number);

                                if (abacus.carry <= digitCount) {
                                    numbers.push(number);
                                    carries.push(abacus.carry);
                                    break;
                                }

                                abacus = new Abacus(tempAbacusValue);
                            }
                        }

                        const complexity = getCalculateComplexity(carries.slice(1), digitCount);
                        // 1 桁 2 口 easy の閾値が 0 であることへの対応
                        if (
                            complexityMap.addition[complexityMapKey][difficulty] <= 0
                            && complexity <= 0
                        ) {
                            return numbers;
                        }
                        if (complexity < complexityMap.addition[complexityMapKey][difficulty]) {
                            return numbers;
                        }

                        break;
                    }
                    case difficultyMap.normal: {
                        for (let i = 0; i < length; i++) {
                            const number = getRandomInt(digitCount, numbers.slice(-1)[0] || null, true);
                            abacus = new Abacus(abacus.value).add(number);
                            numbers.push(number);
                            carries.push(abacus.carry);
                        }

                        const complexity = getCalculateComplexity(carries.slice(1), digitCount);
                        if (complexity >= complexityMap.addition[complexityMapKey][difficultyMap.easy]
                            && complexity < complexityMap.addition[complexityMapKey][difficultyMap.hard]) {
                            return numbers;
                        }

                        break;
                    }
                    case difficultyMap.hard: {
                        let tempAbacusValue;
                        for (let i = 0; i < length; i++) {
                            let getIntRetry = 0;
                            let bestNumber;
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

                        const complexity = getCalculateComplexity(carries.slice(1), digitCount);
                        if (complexity >= complexityMap.addition[complexityMapKey][difficulty]) {
                            return numbers;
                        }

                        break;
                    }
                    default:
                        throw new RangeError('invalid difficulty');
                }
                break;
            default:
                throw new RangeError('invalid mode');
        }
        retry++;
    }

    throw new Error('failed to generate numbers');
}

export class FlashAnswer {
    /**
     * @param {number} answer
     */
    constructor(answer) {
        this._value = answer
    }

    toNumber() {
        return this._value
    }

    toDisplay() {
        return this._value.toLocaleString()
    }
}
