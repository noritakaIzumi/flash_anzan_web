import {Abacus} from "./abacus";
import {getCalculateComplexity} from "./flash_analysis";
import {complexityMap} from "./complexity_map";
import {difficultyMap, generateNumbersRetryLimit, modeNames} from "./globals";

/**
 * 出題数字を作成する。
 * @param {number} digitCount 桁数
 * @param {number} length 口数
 * @param {string} difficulty 難易度
 * @param {string} mode モード
 * @returns {*[]|*}
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
        const previousNumDigits = String(previousNum).split('').reverse().map((n) => {
            return Number(n);
        });
        let digits = [getRandomDigit([0].concat(previousNumDigits.slice(-1)))];
        let i = 0;
        while (i < digitCount - 1) {
            let digit = null;
            if (digitCount <= 9 && digitAllDifferent) {
                digit = getRandomDigit(digits.concat(previousNumDigits[i]));
            } else {
                digit = getRandomDigit();
            }
            digits.push(digit);
            i++;
        }
        return Number(String(digits[0]) + digits.slice(1).reverse().join(''));
    }

    let retry = 0;
    while (retry < generateNumbersRetryLimit) {
        switch (mode) {
            case modeNames.multiplication: {
                let numbers = [];
                let abacus = new Abacus();
                let carries = [];
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
                        return [];
                }

                break;
            }
            case modeNames.addition:
                const complexityMapKey = `${digitCount}-${length}`;
                switch (difficulty) {
                    case difficultyMap.easy: {
                        let numbers = [];
                        let abacus = new Abacus();
                        let carries = [];
                        for (let i = 0; i < length; i++) {
                            while (true) {
                                const number = getRandomInt(digitCount, numbers.slice(-1)[0], true);
                                abacus = new Abacus(abacus.value).add(number);

                                if (abacus.carry <= digitCount) {
                                    numbers.push(number);
                                    carries.push(abacus.carry);
                                    break;
                                }
                            }
                        }

                        if (getCalculateComplexity(carries.slice(1), digitCount) < complexityMap.addition[complexityMapKey][difficulty]) {
                            return numbers;
                        }

                        break;
                    }
                    case difficultyMap.normal: {
                        let numbers = [];
                        let abacus = new Abacus();
                        let carries = [];
                        for (let i = 0; i < length; i++) {
                            const number = getRandomInt(digitCount, numbers.slice(-1)[0], true);
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
                        let numbers = [];
                        let abacus = new Abacus();
                        let carries = [];
                        for (let i = 0; i < length; i++) {
                            let getIntRetry = 0;
                            while (true) {
                                const number = getRandomInt(digitCount);
                                if (number === numbers.slice(-1)[0]) {
                                    continue;
                                }

                                abacus = new Abacus(abacus.value).add(number);

                                if (i >= 1 && abacus.carry < digitCount && getIntRetry < 100) {
                                    getIntRetry++;
                                    continue;
                                }

                                numbers.push(number);
                                carries.push(abacus.carry);
                                break;
                            }
                        }

                        if (getCalculateComplexity(carries.slice(1), digitCount) >= complexityMap.addition[complexityMapKey][difficulty]) {
                            return numbers;
                        }

                        break;
                    }
                    default:
                        return [];
                }
                break;
            default:
                return [];
        }
        retry++;
    }
    return numbers;
}