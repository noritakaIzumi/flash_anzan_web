import {Abacus} from "../abacus.js";
import {calculateComplexity} from "./flashAnalysis.js";
import {
    Complexity,
    ComplexityThreshold,
    ComplexityThresholdMapByMode,
    ComplexityThresholdMapKey,
    FlashDifficulty,
    FlashDigit,
    FlashMode,
    generateNumbersRetryLimit,
    multiplyFigure
} from "../globals.js";
import {FlashParam} from "./flashParamSet.js";
import {FlashNumberHistory, flashNumberHistoryRegistry} from "./flashNumberHistory.js";
import {ExecuteInterface} from "../interface/executeInterface.js";

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
        ? []
        : String(previousNum).split('').reverse().map((n) => {
            return Number(n);
        });
    let digits = [getRandomDigit([0].concat(previousNumDigits.slice(-1)))];
    let i = 0;
    while (i < digitCount - 1) {
        const digit = digitCount <= 9 && digitAllDifferent
            ? getRandomDigit(digits.concat(previousNumDigits[i]))
            : getRandomDigit([previousNumDigits[i]]);
        digits.push(digit);
        i++;
    }
    return Number(String(digits[0]) + digits.slice(1).reverse().join(''));
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
    get raw(): T[] {
        return this._raw;
    }

    protected readonly _raw: T[];

    constructor(numbers: T[]) {
        this._raw = numbers;
    }

    abstract toDisplay(): string[];
}

export class AdditionModeFlashNumbers extends FlashNumbers<FlashDigit["addition"]> {
    toDisplay(): string[] {
        return this._raw.map((n) => n.toLocaleString());
    }
}

export class MultiplicationModeFlashNumbers extends FlashNumbers<FlashDigit["multiplication"]> {
    toDisplay(): string[] {
        return this._raw.map((p) => p[0].toLocaleString() + multiplyFigure + p[1].toLocaleString());
    }
}

export abstract class AbstractGetFlashAnswerAdapter<T extends FlashMode> implements ExecuteInterface {
    abstract execute(numbers: FlashDigit[T][]): FlashAnswer;
}

export class AdditionModeGetFlashAnswerAdapter extends AbstractGetFlashAnswerAdapter<"addition"> {
    execute(numbers: FlashDigit["addition"][]): FlashAnswer {
        return new FlashAnswer(numbers.reduce((a, b) => a + b));
    }
}

export class MultiplicationModeGetFlashAnswerAdapter extends AbstractGetFlashAnswerAdapter<"multiplication"> {
    execute(numbers: FlashDigit["multiplication"][]): FlashAnswer {
        let sum: number = 0;
        for (const [number1, number2] of numbers) {
            sum += number1 * number2
        }
        return new FlashAnswer(sum)
    }
}

export abstract class AbstractFlashGenerator<T extends FlashMode> implements ExecuteInterface {
    protected createNewNumbersAdapter: AbstractCreateNewNumbersAdapter<T>;
    protected flashNumbersClass: { new(numbers: FlashDigit[T][]): FlashNumbers<FlashDigit[T]> };
    protected getFlashAnswerAdapter: { new(): AbstractGetFlashAnswerAdapter<T> }

    constructor(
        {
            createNewNumbersAdapter,
            flashNumbersClass,
            getFlashAnswerAdapter,
        }: {
            createNewNumbersAdapter: AbstractCreateNewNumbersAdapter<T>,
            flashNumbersClass: { new(numbers: FlashDigit[T][]): FlashNumbers<FlashDigit[T]> },
            getFlashAnswerAdapter: { new(): AbstractGetFlashAnswerAdapter<T> }
        }
    ) {
        this.createNewNumbersAdapter = createNewNumbersAdapter
        this.flashNumbersClass = flashNumbersClass
        this.getFlashAnswerAdapter = getFlashAnswerAdapter
    }

    execute(requestParam: FlashParam<FlashDigit[T]>, options: { repeat?: boolean } = {}) {
        const numberHistoryObj = this.getNumberHistoryObj();
        const digitIsSame = !!numberHistoryObj?.digitEquals(requestParam.digit)
        const numberHistory = numberHistoryObj?.numberHistory || []

        const numbers = (() => {
            if (!!options.repeat && digitIsSame) {
                if (requestParam.length === numberHistory.length) {
                    return numberHistory;
                }
                if (requestParam.length < numberHistory.length) {
                    return numberHistory.slice(0, requestParam.length);
                }
                return numberHistory.concat(this.createNumbers(requestParam.digit, requestParam.length - numberHistory.length, requestParam.difficulty));
            }
            return this.createNumbers(requestParam.digit, requestParam.length, requestParam.difficulty);
        })();

        return {numbers: new this.flashNumbersClass(numbers), answer: new this.getFlashAnswerAdapter().execute(numbers)}
    }

    protected abstract getNumberHistoryObj(): FlashNumberHistory<FlashDigit[T]> | null;

    protected createNumbers(digitCount: FlashDigit[T], length: number, difficulty: FlashDifficulty): FlashDigit[T][] {
        let retry = 0;
        while (retry < generateNumbersRetryLimit) {
            try {
                return this.createNewNumbersAdapter.execute(digitCount, length, difficulty)
            } catch (e: any) {
                if (e instanceof CreatedNumbersDoNotSatisfyConstraintError) {
                    // TODO: 開発時だけ何かログを出す
                    retry++;
                } else {
                    throw e
                }
            }
        }
        throw new Error('retry limit exceeded for generating numbers');
    }
}

export class AdditionModeFlashGenerator extends AbstractFlashGenerator<"addition"> {
    protected getNumberHistoryObj(): FlashNumberHistory<FlashDigit["addition"]> | null {
        return flashNumberHistoryRegistry.getHistory("addition")
    }
}

export class MultiplicationModeFlashGenerator extends AbstractFlashGenerator<"multiplication"> {
    protected getNumberHistoryObj(): FlashNumberHistory<FlashDigit["multiplication"]> | null {
        return flashNumberHistoryRegistry.getHistory("multiplication")
    }
}

type CreateRawNumbersAdapterMapByMode<T extends FlashMode> = { [key in FlashDifficulty]: { new(): AbstractCreateRawNumbersAdapter<T> } };
type ComplexityIsValidAdapterMapByMode = { [key in FlashDifficulty]: { new(): AbstractComplexityIsValidAdapter } };

export abstract class AbstractCreateNewNumbersAdapter<T extends FlashMode> implements ExecuteInterface {
    protected createRawNumbersAdaptersByMode: CreateRawNumbersAdapterMapByMode<T>;
    protected complexityIsValidAdaptersByMode: ComplexityIsValidAdapterMapByMode;
    protected complexityThresholdMapByMode: ComplexityThresholdMapByMode<T>;

    constructor(
        {
            createRawNumbersAdapterMapByMode,
            complexityIsValidAdapterMapByMode,
            complexityThresholdMapByMode,
        }: {
            createRawNumbersAdapterMapByMode: CreateRawNumbersAdapterMapByMode<T>,
            complexityIsValidAdapterMapByMode: ComplexityIsValidAdapterMapByMode,
            complexityThresholdMapByMode: ComplexityThresholdMapByMode<T>,
        }
    ) {
        this.createRawNumbersAdaptersByMode = createRawNumbersAdapterMapByMode
        this.complexityIsValidAdaptersByMode = complexityIsValidAdapterMapByMode
        this.complexityThresholdMapByMode = complexityThresholdMapByMode
    }

    execute(digitCount: FlashDigit[T], length: number, difficulty: FlashDifficulty): FlashDigit[T][] {
        const result = new this.createRawNumbersAdaptersByMode[difficulty]().execute(digitCount, length)
        const numbers = result.numbers
        const carries = result.carries

        const complexity = this.getComplexity(carries, digitCount);
        const complexityThresholdMapKey = this.getComplexityThresholdMapKey(digitCount, length);

        const complexityThreshold = this.complexityThresholdMapByMode[complexityThresholdMapKey];
        if (!complexityThreshold) {
            throw new RangeError(`invalid digit or length: (digit: ${digitCount}, length: ${length})`)
        }

        const complexityIsValid = new this.complexityIsValidAdaptersByMode[difficulty]().execute(complexity, complexityThreshold);
        if (complexityIsValid) {
            return numbers;
        }

        throw new CreatedNumbersDoNotSatisfyConstraintError()
    }

    protected abstract getComplexity(carries: number[], digitCount: FlashDigit[T]): number;

    protected abstract getComplexityThresholdMapKey(digitCount: FlashDigit[T], length: number): ComplexityThresholdMapKey[T];
}

export class AdditionModeCreateNewNumbersAdapter extends AbstractCreateNewNumbersAdapter<"addition"> {
    protected getComplexity(carries: number[], digitCount: FlashDigit["addition"]): number {
        return calculateComplexity(carries.slice(1), digitCount)
    }

    protected getComplexityThresholdMapKey(digitCount: FlashDigit["addition"], length: number): ComplexityThresholdMapKey["addition"] {
        return `${digitCount}-${length}`
    }
}

export class MultiplicationModeCreateNewNumbersAdapter extends AbstractCreateNewNumbersAdapter<"multiplication"> {
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
    abstract execute(digitCount: FlashDigit[T], length: number): { numbers: FlashDigit[T][], carries: number[] };
}

export class AdditionModeEasyDifficultyCreateRawNumbersAdapter extends AbstractCreateRawNumbersAdapter<"addition"> {
    execute(digitCount: FlashDigit["addition"], length: number): { numbers: FlashDigit["addition"][], carries: number[] } {
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
    execute(digitCount: FlashDigit["addition"], length: number): { numbers: FlashDigit["addition"][]; carries: number[] } {
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
    execute(digitCount: FlashDigit["addition"], length: number): { numbers: FlashDigit["addition"][]; carries: number[] } {
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

/**
 * たし算モード・難易度未指定
 * 複雑度境界リストの作成に使用する
 */
export class AdditionModeUnknownDifficultyCreateRawNumbersAdapter extends AbstractCreateRawNumbersAdapter<"addition"> {
    execute(digitCount: FlashDigit["addition"], length: number): { numbers: FlashDigit["addition"][]; carries: number[] } {
        // 出題数字
        let numbers: FlashDigit["addition"][] = [];
        // 繰り上がり回数
        let carries: number[] = [];

        let abacus = new Abacus(0);
        for (let i = 0; i < length; i++) {
            const number = getRandomInt(digitCount, numbers.slice(-1)[0] || null, false);
            abacus = new Abacus(abacus.value).add(number);
            numbers.push(number);
            carries.push(abacus.carry);
        }

        return {numbers: numbers, carries: carries}
    }
}

export class MultiplicationModeEasyDifficultyCreateRawNumbersAdapter extends AbstractCreateRawNumbersAdapter<"multiplication"> {
    execute(digitCount: FlashDigit["multiplication"], length: number): { numbers: FlashDigit["multiplication"][], carries: number[] } {
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

/**
 * かけ算モード・難易度未指定
 * 複雑度境界リストの作成に使用する
 */
export class MultiplicationModeUnknownDifficultyCreateRawNumbersAdapter extends MultiplicationModeEasyDifficultyCreateRawNumbersAdapter {
}

export type CreateRawNumbersAdapterMap = { [mode in FlashMode]: CreateRawNumbersAdapterMapByMode<mode> }
export const createRawNumbersAdapterMap: CreateRawNumbersAdapterMap = {
    addition: {
        easy: AdditionModeEasyDifficultyCreateRawNumbersAdapter,
        normal: AdditionModeNormalDifficultyCreateRawNumbersAdapter,
        hard: AdditionModeHardDifficultyCreateRawNumbersAdapter,
    },
    multiplication: {
        easy: MultiplicationModeEasyDifficultyCreateRawNumbersAdapter,
        normal: MultiplicationModeNormalDifficultyCreateRawNumbersAdapter,
        hard: MultiplicationModeHardDifficultyCreateRawNumbersAdapter,
    },
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

export type ComplexityIsValidAdapterMap = { [mode in FlashMode]: ComplexityIsValidAdapterMapByMode }
export const complexityIsValidAdapterMap: ComplexityIsValidAdapterMap = {
    addition: {
        easy: AdditionModeEasyDifficultyComplexityIsValidAdapter,
        normal: AdditionModeNormalDifficultyComplexityIsValidAdapter,
        hard: AdditionModeHardDifficultyComplexityIsValidAdapter,
    },
    multiplication: {
        easy: MultiplicationModeEasyDifficultyComplexityIsValidAdapter,
        normal: MultiplicationModeNormalDifficultyComplexityIsValidAdapter,
        hard: MultiplicationModeHardDifficultyComplexityIsValidAdapter,
    },
}
