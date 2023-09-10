import {Abacus} from "./abacus";
import {calculateComplexity} from "./flash_analysis";
import {complexityThresholdMap} from "./complexity_map";
import {
    Complexity,
    ComplexityThreshold,
    ComplexityThresholdMapByMode,
    ComplexityThresholdMapKey,
    difficultyMap,
    FlashDifficulty,
    FlashDigit,
    FlashMode,
    flashParamElements,
    generateNumbersRetryLimit,
    multiplyFigure
} from "./globals";
import {FlashParam} from "./util_should_categorize";
import {FlashNumberHistory, flashNumberHistoryRegistry, FlashNumberHistoryRegistry} from "./flashNumberHistory";

function getRandomDigit(excepts: number[] = []) {
    const d: number[] = [];
    for (let i = 0; i < 10; i++) {
        if (excepts.indexOf(i) >= 0) {
            continue;
        }
        d.push(i);
    }
    return d[Math.floor(Math.random() * d.length)];
}

function getRandomInt(digitCount: number, previousNum: number | null = null, digitAllDifferent: boolean = false): number {
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
export function generateNumbers(mode: "addition", digitCount: number, length: number, difficulty: FlashDifficulty): number[]
export function generateNumbers(mode: "multiplication", digitCount: [number, number], length: number, difficulty: FlashDifficulty): [number, number][]
export function generateNumbers(mode: FlashMode, digitCount: number | number[], length: number, difficulty: FlashDifficulty) {
    switch (mode) {
        case "addition":
            return generateNumbersAdditionMode(digitCount as number, length, difficulty)
        case "multiplication":
            return generateNumbersMultiplicationMode(digitCount as number[], length, difficulty)
    }
}

export function generateNumbersMultiplicationMode(digitCount: number[], length: number, difficulty: FlashDifficulty): [number, number][] {
    let retry = 0;
    while (retry < generateNumbersRetryLimit) {
        const [numbers, carries] = (() => {
            // そろばん
            let abacus = new Abacus(0);
            // 出題数字
            let numbers: [number, number][] = [];
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

        const complexity = calculateComplexity(carries, digitCount[0] * digitCount[1]);
        const complexityMapKey = `${digitCount[0]}-${digitCount[1]}-${length}`;

        const condition = (() => {
            if (difficulty === difficultyMap.easy) {
                return complexityThresholdMap.multiplication[complexityMapKey][difficulty] <= 0 && complexity <= 0 // 1 桁 × 1 桁 2 口 easy の閾値が 0 であることへの対応
                    || complexity < complexityThresholdMap.multiplication[complexityMapKey][difficulty];
            }
            if (difficulty === difficultyMap.normal) {
                return complexity >= complexityThresholdMap.multiplication[complexityMapKey][difficultyMap.easy]
                    && complexity < complexityThresholdMap.multiplication[complexityMapKey][difficultyMap.hard];
            }
            if (difficulty === difficultyMap.hard) {
                return complexity >= complexityThresholdMap.multiplication[complexityMapKey][difficulty];
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

        const complexity = calculateComplexity(carries.slice(1), digitCount);
        const complexityMapKey = `${digitCount}-${length}`;

        const condition = (() => {
            if (difficulty === 'easy') {
                return complexityThresholdMap.addition[complexityMapKey][difficulty] <= 0 && complexity <= 0 // 1 桁 2 口 easy の閾値が 0 であることへの対応
                    || complexity < complexityThresholdMap.addition[complexityMapKey][difficulty];
            }
            if (difficulty === 'normal') {
                return complexity >= complexityThresholdMap.addition[complexityMapKey][difficultyMap.easy]
                    && complexity < complexityThresholdMap.addition[complexityMapKey][difficultyMap.hard];
            }
            if (difficulty === 'hard') {
                return complexity >= complexityThresholdMap.addition[complexityMapKey][difficulty];
            }
        })();

        if (condition) {
            return numbers;
        }

        retry++;
    }

    throw new Error('failed to generate numbers');
}

export interface ToDisplayInterface<T> {
    toDisplay(): T;
}

export class FlashAnswer implements ToDisplayInterface<string> {
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

    toDisplay(): string {
        return this._value.toLocaleString()
    }
}

export abstract class FlashNumbers<T> implements ToDisplayInterface<string[]> {
    get numbers(): T[] {
        return this._numbers;
    }

    protected readonly _numbers: T[];

    constructor(numbers: T[]) {
        this._numbers = numbers;
    }

    abstract toDisplay(): string[];
}

export class AdditionModeFlashNumbers extends FlashNumbers<FlashDigit["addition"]> {
    toDisplay(): string[] {
        return this._numbers.map((n) => n.toLocaleString());
    }
}

export class MultiplicationModeFlashNumbers extends FlashNumbers<FlashDigit["multiplication"]> {
    toDisplay(): string[] {
        return this._numbers.map((p) => p[0].toLocaleString() + multiplyFigure + p[1].toLocaleString());
    }
}

export interface ExecuteInterface {
    execute(...args: any[]): any;
}

export abstract class AbstractFlashNumberGenerator<T extends FlashMode> implements ExecuteInterface {
    protected flashNumberHistoryRegistry: FlashNumberHistoryRegistry;
    protected createNewNumbers: AbstractCreateNewNumbers<T>;
    protected flashNumbersClass: { new(numbers: FlashDigit[T][]): FlashNumbers<FlashDigit[T]> };

    constructor(
        {
            flashNumberHistoryRegistry,
            createNewNumbers,
            flashNumbersClass,
        }: {
            flashNumberHistoryRegistry: FlashNumberHistoryRegistry,
            createNewNumbers: AbstractCreateNewNumbers<T>,
            flashNumbersClass: { new(numbers: FlashDigit[T][]): FlashNumbers<FlashDigit[T]> },
        }
    ) {
        this.flashNumberHistoryRegistry = flashNumberHistoryRegistry
        this.createNewNumbers = createNewNumbers
        this.flashNumbersClass = flashNumbersClass
    }

    execute(requestParam: FlashParam<FlashDigit[T]>, repeat: boolean) {
        const numberHistoryObj = this.getNumberHistoryObj();
        const digitIsSame = !!numberHistoryObj?.digitEquals(requestParam.digit)
        const numberHistory = numberHistoryObj?.numberHistory || []

        const numbers = (() => {
            if (repeat && digitIsSame) {
                if (requestParam.length === numberHistory.length) {
                    return numberHistory;
                }
                if (requestParam.length < numberHistory.length) {
                    return numberHistory.slice(0, requestParam.length);
                }
                return numberHistory.concat(this.createNumbers(requestParam.digit, requestParam.length - numberHistory.length, requestParam.difficulty));
            }
            return this.createNumbers(requestParam.digit, requestParam.length - numberHistory.length, requestParam.difficulty);
        })();

        return new this.flashNumbersClass(numbers)
    }

    protected abstract getNumberHistoryObj(): FlashNumberHistory<FlashDigit[T]> | null;

    protected createNumbers(digitCount: FlashDigit[T], length: number, difficulty: FlashDifficulty): FlashDigit[T][] {
        let retry = 0;
        while (retry < generateNumbersRetryLimit) {
            try {
                return this.createNewNumbers.execute(digitCount, length, difficulty)
            } catch (e: any) {
                if (e instanceof CreatedNumbersDoNotSatisfyConstraintError) {
                    // TODO: 開発時だけ何かログを出す
                    retry++;
                } else {
                    throw new Error('an error occurred when creating numbers')
                }
            }
        }
        throw new Error('retry limit exceeded for generating numbers');
    }
}

export class AdditionModeFlashNumberGenerator extends AbstractFlashNumberGenerator<"addition"> {
    protected getCurrentParam(): FlashParam<FlashDigit["addition"]> {
        return {
            digit: flashParamElements.addition.digit.updateParam().valueV1,
            length: flashParamElements.addition.length.updateParam().valueV1,
            time: flashParamElements.addition.time.updateParam().valueV1,
            difficulty: flashParamElements.common.difficulty.valueV1,
            flashRate: flashParamElements.common.flashRate.updateParam().valueV1,
            offset: flashParamElements.common.offset.updateParam().valueV1,
        }
    }

    protected getNumberHistoryObj(): FlashNumberHistory<FlashDigit["addition"]> | null {
        return flashNumberHistoryRegistry.getHistory("addition")
    }
}

export class MultiplicationModeFlashNumberGenerator extends AbstractFlashNumberGenerator<"multiplication"> {
    protected getNumberHistoryObj(): FlashNumberHistory<FlashDigit["multiplication"]> | null {
        return flashNumberHistoryRegistry.getHistory("multiplication")
    }

    protected getCurrentParam(): FlashParam<FlashDigit["multiplication"]> {
        return {
            digit: [
                flashParamElements.multiplication.digit1.updateParam().valueV1,
                flashParamElements.multiplication.digit2.updateParam().valueV1,
            ],
            length: flashParamElements.multiplication.length.updateParam().valueV1,
            time: flashParamElements.multiplication.time.updateParam().valueV1,
            difficulty: flashParamElements.common.difficulty.valueV1,
            flashRate: flashParamElements.common.flashRate.updateParam().valueV1,
            offset: flashParamElements.common.offset.updateParam().valueV1,
        }
    }
}

type CreateRawNumbersAdapter<T extends FlashMode> = { [key in FlashDifficulty]: { new(): AbstractCreateRawNumbersAdapter<T> } };
type ComplexityIsValidAdapter = { [key in FlashDifficulty]: { new(): AbstractComplexityIsValidAdapter } };

export abstract class AbstractCreateNewNumbers<T extends FlashMode> implements ExecuteInterface {
    protected createRawNumbersAdapter: CreateRawNumbersAdapter<T>;
    protected complexityIsValidAdapter: ComplexityIsValidAdapter;
    protected complexityThresholdMapByMode: ComplexityThresholdMapByMode<T>;

    constructor(
        {
            createRawNumbersClasses,
            complexityIsValidAdapter,
            complexityThresholdMapByMode,
        }: {
            createRawNumbersClasses: CreateRawNumbersAdapter<T>,
            complexityIsValidAdapter: ComplexityIsValidAdapter,
            complexityThresholdMapByMode: ComplexityThresholdMapByMode<T>,
        }
    ) {
        this.createRawNumbersAdapter = createRawNumbersClasses
        this.complexityIsValidAdapter = complexityIsValidAdapter
        this.complexityThresholdMapByMode = complexityThresholdMapByMode
    }

    execute(digitCount: FlashDigit[T], length: number, difficulty: FlashDifficulty): FlashDigit[T][] {
        const result = new this.createRawNumbersAdapter[difficulty]().execute(digitCount)
        const numbers = result.numbers
        const carries = result.carries

        const complexity = this.getComplexity(carries, digitCount);
        const complexityThresholdMapKey = this.getComplexityThresholdMapKey(digitCount, length);

        const complexityThreshold = this.complexityThresholdMapByMode[complexityThresholdMapKey];
        if (!complexityThreshold) {
            throw new RangeError(`invalid digit or length: (digit: ${digitCount}, length: ${length})`)
        }

        const complexityIsValid = new this.complexityIsValidAdapter[difficulty]().execute(complexity, complexityThreshold);
        if (complexityIsValid) {
            return numbers;
        }

        throw new CreatedNumbersDoNotSatisfyConstraintError()
    }

    protected abstract getComplexity(carries: number[], digitCount: FlashDigit[T]): number;

    protected abstract getComplexityThresholdMapKey(digitCount: FlashDigit[T], length: number): ComplexityThresholdMapKey[T];
}

export class AdditionModeCreateNewNumbers extends AbstractCreateNewNumbers<"addition"> {
    protected getComplexity(carries: number[], digitCount: FlashDigit["addition"]): number {
        return calculateComplexity(carries.slice(1), digitCount)
    }

    protected getComplexityThresholdMapKey(digitCount: FlashDigit["addition"], length: number): ComplexityThresholdMapKey["addition"] {
        return `${digitCount}-${length}`
    }
}

export class MultiplicationModeCreateNewNumbers extends AbstractCreateNewNumbers<"multiplication"> {
    protected getComplexity(carries: number[], digitCount: FlashDigit["multiplication"]): number {
        return calculateComplexity(carries, digitCount[0] * digitCount[1])
    }

    protected getComplexityThresholdMapKey(digitCount: FlashDigit["multiplication"], length: number): ComplexityThresholdMapKey["multiplication"] {
        return `${digitCount[0]}-${digitCount[1]}-${length}`
    }
}

/**
 * 生成された数字が条件を満たさない場合に返されるエラー
 */
export class CreatedNumbersDoNotSatisfyConstraintError extends Error {
}

export abstract class AbstractCreateRawNumbersAdapter<T extends keyof FlashDigit> implements ExecuteInterface {
    abstract execute(digitCount: FlashDigit[T]): { numbers: FlashDigit[T][], carries: number[] };
}

export class AdditionModeEasyDifficultyCreateRawNumbersAdapter extends AbstractCreateRawNumbersAdapter<"addition"> {
    execute(digitCount: FlashDigit["addition"]): { numbers: FlashDigit["addition"][], carries: number[] } {
        // 出題数字
        let numbers: FlashDigit["addition"][] = [];
        // 繰り上がり回数
        let carries: number[] = [];

        let abacus = new Abacus(0);
        let tempAbacusValue: number;
        for (let i = 0; i < length; i++) {
            let getIntRetry = 0;
            let bestNumber = 0;
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

        return {numbers: numbers, carries: carries}
    }
}

export class AdditionModeNormalDifficultyCreateRawNumbersAdapter extends AbstractCreateRawNumbersAdapter<"addition"> {
    execute(digitCount: FlashDigit["addition"]): { numbers: FlashDigit["addition"][]; carries: number[] } {
        // 出題数字
        let numbers: FlashDigit["addition"][] = [];
        // 繰り上がり回数
        let carries: number[] = [];

        let abacus = new Abacus(0);
        for (let i = 0; i < length; i++) {
            const number = getRandomInt(digitCount, numbers.slice(-1)[0] || null, true);
            abacus = new Abacus(abacus.value).add(number);
            numbers.push(number);
            carries.push(abacus.carry);
        }

        return {numbers: numbers, carries: carries}
    }
}

export class AdditionModeHardDifficultyCreateRawNumbersAdapter extends AbstractCreateRawNumbersAdapter<"addition"> {
    execute(digitCount: FlashDigit["addition"]): { numbers: FlashDigit["addition"][]; carries: number[] } {
        // 出題数字
        let numbers: FlashDigit["addition"][] = [];
        // 繰り上がり回数
        let carries: number[] = [];

        let abacus = new Abacus(0);
        let tempAbacusValue: number;
        for (let i = 0; i < length; i++) {
            let getIntRetry = 0;
            let bestNumber = 0;
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

        return {numbers: numbers, carries: carries}
    }
}

export class MultiplicationModeEasyDifficultyCreateRawNumbersAdapter extends AbstractCreateRawNumbersAdapter<"multiplication"> {
    execute(digitCount: FlashDigit["multiplication"]): { numbers: FlashDigit["multiplication"][], carries: number[] } {
        // そろばん
        let abacus = new Abacus(0);
        // 出題数字
        let numbers: FlashDigit["multiplication"][] = [];
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

        return {numbers: numbers, carries: carries}
    }
}

export class MultiplicationModeNormalDifficultyCreateRawNumbersAdapter extends MultiplicationModeEasyDifficultyCreateRawNumbersAdapter {
}

export class MultiplicationModeHardDifficultyCreateRawNumbersAdapter extends MultiplicationModeEasyDifficultyCreateRawNumbersAdapter {
}

export abstract class AbstractComplexityIsValidAdapter implements ExecuteInterface {
    abstract execute(complexity: Complexity, complexitySchema: ComplexityThreshold): boolean;
}

export class AdditionModeEasyDifficultyComplexityIsValidAdapter extends AbstractComplexityIsValidAdapter {
    execute(complexity: Complexity, complexitySchema: ComplexityThreshold): boolean {
        return complexitySchema.easy <= 0 && complexity <= 0 // 1 桁 2 口 easy の閾値が 0 であることへの対応
            || complexity < complexitySchema.easy;
    }
}

export class AdditionModeNormalDifficultyComplexityIsValidAdapter extends AbstractComplexityIsValidAdapter {
    execute(complexity: Complexity, complexitySchema: ComplexityThreshold): boolean {
        return complexity >= complexitySchema.easy
            && complexity < complexitySchema.hard;
    }
}

export class AdditionModeHardDifficultyComplexityIsValidAdapter extends AbstractComplexityIsValidAdapter {
    execute(complexity: Complexity, complexitySchema: ComplexityThreshold): boolean {
        return complexity >= complexitySchema.hard;
    }
}

export class MultiplicationModeEasyDifficultyComplexityIsValidAdapter extends AbstractComplexityIsValidAdapter {
    execute(complexity: Complexity, complexitySchema: ComplexityThreshold): boolean {
        return complexitySchema.easy <= 0 && complexity <= 0 // 1 桁 2 口 easy の閾値が 0 であることへの対応
            || complexity < complexitySchema.easy;
    }
}

export class MultiplicationModeNormalDifficultyComplexityIsValidAdapter extends AbstractComplexityIsValidAdapter {
    execute(complexity: Complexity, complexitySchema: ComplexityThreshold): boolean {
        return complexity >= complexitySchema.easy
            && complexity < complexitySchema.hard;
    }
}

export class MultiplicationModeHardDifficultyComplexityIsValidAdapter extends AbstractComplexityIsValidAdapter {
    execute(complexity: Complexity, complexitySchema: ComplexityThreshold): boolean {
        return complexity >= complexitySchema.hard;
    }
}
