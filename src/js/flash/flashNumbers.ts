import { Abacus } from "../abacus.js"
import { calculateComplexity } from "./flashAnalysis.js"
import {
    type Complexity,
    type ComplexityThreshold,
    type ComplexityThresholdMapByMode,
    type ComplexityThresholdMapKey,
    type FlashDifficulty,
    type FlashDigit,
    type FlashMode,
    generateNumbersRetryLimit,
    multiplyFigure,
    type UnknownFlashDifficulty
} from "../globals.js"
import { type FlashParam } from "./flashParamSet.js"
import { type FlashNumberHistory, flashNumberHistoryRegistry } from "./flashNumberHistory.js"
import { type ExecuteInterface } from "../interface/executeInterface.js"
import { type FlashOptions } from "./flashQuestionCreator.js"

function getRandomDigit(excepts: number[] = []): number {
    const d: number[] = []
    for (let i = 0; i < 10; i++) {
        if (excepts.includes(i)) {
            continue
        }
        d.push(i)
    }
    return d[Math.floor(Math.random() * d.length)]
}

function getRandomInt(digitCount: number, previousNum: number | null = null, digitAllDifferent: boolean = false): number {
    const previousNumDigits = previousNum === null
        ? []
        : String(previousNum).split("").reverse().map((n) => {
            return Number(n)
        })
    const digits = [getRandomDigit([0].concat(previousNumDigits.slice(-1)))]
    let i = 0
    while (i < digitCount - 1) {
        const digit = digitCount <= 9 && digitAllDifferent
            ? getRandomDigit(digits.concat(previousNumDigits[i]))
            : getRandomDigit([previousNumDigits[i]])
        digits.push(digit)
        i++
    }
    return Number(String(digits[0]) + digits.slice(1).reverse().join(""))
}

export interface ToDisplayInterface<T> {
    toDisplay: () => T
}

export class FlashAnswer implements ToDisplayInterface<string> {
    private readonly _value: number

    /**
     * @param {number} answer
     */
    constructor(answer: number) {
        this._value = answer
    }

    toString(): string {
        return String(this._value)
    }

    toDisplay(): string {
        return this._value.toLocaleString()
    }
}

export abstract class FlashNumbers<T> implements ToDisplayInterface<string[]> {
    get raw(): T[] {
        return this._raw
    }

    protected readonly _raw: T[]

    constructor(numbers: T[]) {
        this._raw = numbers
    }

    abstract toDisplay(): string[]
}

export class AdditionModeFlashNumbers extends FlashNumbers<FlashDigit["addition"]> {
    toDisplay(): string[] {
        return this._raw.map((n) => n.toLocaleString())
    }
}

export class MultiplicationModeFlashNumbers extends FlashNumbers<FlashDigit["multiplication"]> {
    toDisplay(): string[] {
        return this._raw.map((p) => p[0].toLocaleString() + multiplyFigure + p[1].toLocaleString())
    }
}

export abstract class AbstractGetFlashAnswerAdapter<T extends FlashMode> implements ExecuteInterface {
    abstract execute(numbers: Array<FlashDigit[T]>): FlashAnswer
}

export class AdditionModeGetFlashAnswerAdapter extends AbstractGetFlashAnswerAdapter<"addition"> {
    execute(numbers: Array<FlashDigit["addition"]>): FlashAnswer {
        return new FlashAnswer(numbers.reduce((a, b) => a + b))
    }
}

export class MultiplicationModeGetFlashAnswerAdapter extends AbstractGetFlashAnswerAdapter<"multiplication"> {
    execute(numbers: Array<FlashDigit["multiplication"]>): FlashAnswer {
        let sum: number = 0
        for (const [number1, number2] of numbers) {
            sum += number1 * number2
        }
        return new FlashAnswer(sum)
    }
}

export interface Flash<T extends FlashMode> {
    numbers: FlashNumbers<FlashDigit[T]>
    answer: FlashAnswer
}

export abstract class AbstractFlashGenerator<T extends FlashMode> implements ExecuteInterface {
    protected createNewNumbersAdapter: AbstractCreateNewNumbersAdapter<T>
    protected FlashNumbersClass: new(numbers: Array<FlashDigit[T]>) => FlashNumbers<FlashDigit[T]>
    protected GetFlashAnswerAdapter: new() => AbstractGetFlashAnswerAdapter<T>

    constructor(
        {
            createNewNumbersAdapter,
            flashNumbersClass,
            getFlashAnswerAdapter,
        }: {
            createNewNumbersAdapter: AbstractCreateNewNumbersAdapter<T>
            flashNumbersClass: new(numbers: Array<FlashDigit[T]>) => FlashNumbers<FlashDigit[T]>
            getFlashAnswerAdapter: new() => AbstractGetFlashAnswerAdapter<T>
        }
    ) {
        this.createNewNumbersAdapter = createNewNumbersAdapter
        this.FlashNumbersClass = flashNumbersClass
        this.GetFlashAnswerAdapter = getFlashAnswerAdapter
    }

    execute(requestParam: FlashParam<FlashDigit[T]>, options: FlashOptions = {}): Flash<T> {
        const numberHistoryObj = this.getNumberHistoryObj()
        const digitIsSame = numberHistoryObj?.digitEquals(requestParam.digit) ?? false
        const numberHistory = numberHistoryObj?.numberHistory.raw ?? []

        const numbers = (() => {
            if ((options.repeat ?? false) && digitIsSame) {
                if (requestParam.length === numberHistory.length) {
                    return numberHistory
                }
                if (requestParam.length < numberHistory.length) {
                    return numberHistory.slice(0, requestParam.length)
                }
                return numberHistory.concat(this.createNumbers(requestParam.digit, requestParam.length, requestParam.difficulty, options).slice(numberHistory.length - requestParam.length))
            }
            return this.createNumbers(requestParam.digit, requestParam.length, requestParam.difficulty, options)
        })()

        return {
            numbers: new this.FlashNumbersClass(numbers),
            answer: new this.GetFlashAnswerAdapter().execute(numbers),
        }
    }

    protected abstract getNumberHistoryObj(): FlashNumberHistory<FlashDigit[T]> | null

    protected createNumbers(digitCount: FlashDigit[T], length: number, difficulty: FlashDifficulty, options: FlashOptions): Array<FlashDigit[T]> {
        let retry = 0
        while (retry < generateNumbersRetryLimit) {
            try {
                return this.createNewNumbersAdapter.execute(digitCount, length, difficulty, options)
            } catch (e: any) {
                if (e instanceof CreatedNumbersDoNotSatisfyConstraintError) {
                    // TODO: 開発時だけ何かログを出す
                    retry++
                } else {
                    throw e
                }
            }
        }
        throw new Error("retry limit exceeded for generating numbers")
    }
}

export class AdditionModeFlashGenerator extends AbstractFlashGenerator<"addition"> {
    protected getNumberHistoryObj(): FlashNumberHistory<FlashDigit["addition"]> | null {
        return flashNumberHistoryRegistry.addition.history
    }
}

export class MultiplicationModeFlashGenerator extends AbstractFlashGenerator<"multiplication"> {
    protected getNumberHistoryObj(): FlashNumberHistory<FlashDigit["multiplication"]> | null {
        return flashNumberHistoryRegistry.multiplication.history
    }
}

type CreateRawNumbersAdapterMapByMode<T extends FlashMode> = {
    [key in FlashDifficulty | UnknownFlashDifficulty]: new(digitCount: FlashDigit[T], saved: { numbers: Array<FlashDigit[T]>, carries: number[] }) => AbstractCreateRawNumbersAdapter<T>
}
type ComplexityIsValidAdapterMapByMode = {
    [key in FlashDifficulty]: new() => AbstractComplexityIsValidAdapter
}

export abstract class AbstractCreateNewNumbersAdapter<T extends FlashMode> implements ExecuteInterface {
    protected createRawNumbersAdaptersByMode: CreateRawNumbersAdapterMapByMode<T>
    protected complexityIsValidAdaptersByMode: ComplexityIsValidAdapterMapByMode
    protected complexityThresholdMapByMode: ComplexityThresholdMapByMode<T>

    constructor(
        {
            createRawNumbersAdapterMapByMode,
            complexityIsValidAdapterMapByMode,
            complexityThresholdMapByMode,
        }: {
            createRawNumbersAdapterMapByMode: CreateRawNumbersAdapterMapByMode<T>
            complexityIsValidAdapterMapByMode: ComplexityIsValidAdapterMapByMode
            complexityThresholdMapByMode: ComplexityThresholdMapByMode<T>
        }
    ) {
        this.createRawNumbersAdaptersByMode = createRawNumbersAdapterMapByMode
        this.complexityIsValidAdaptersByMode = complexityIsValidAdapterMapByMode
        this.complexityThresholdMapByMode = complexityThresholdMapByMode
    }

    execute(digitCount: FlashDigit[T], length: number, difficulty: FlashDifficulty, options: FlashOptions): Array<FlashDigit[T]> {
        const complexityThresholdMapKey = this.getComplexityThresholdMapKey(digitCount, length)
        const complexityThreshold = this.complexityThresholdMapByMode[complexityThresholdMapKey]

        if (complexityThreshold === undefined) {
            if (options.allowUnknownDifficulty ?? false) {
                // eslint-disable-next-line new-cap
                const createRawNumbersAdapter = new this.createRawNumbersAdaptersByMode.unknown(digitCount, { numbers: [], carries: [] })
                for (let _ = 0; _ < length; _++) {
                    createRawNumbersAdapter.execute()
                }
                return createRawNumbersAdapter.getResult().numbers
            }
            throw new RangeError(`complexity threshold not found at key: (digit: ${JSON.stringify(digitCount)}, length: ${length})`)
        }

        const createRawNumbersAdapter = new this.createRawNumbersAdaptersByMode[difficulty](digitCount, { numbers: [], carries: [] })
        for (let _ = 0; _ < length; _++) {
            createRawNumbersAdapter.execute()
        }
        const result = createRawNumbersAdapter.getResult()
        const numbers = result.numbers
        const carries = result.carries

        const complexity = this.getComplexity(carries, digitCount)
        const complexityIsValid = new this.complexityIsValidAdaptersByMode[difficulty]().execute(complexity, complexityThreshold)
        if (!complexityIsValid) {
            throw new CreatedNumbersDoNotSatisfyConstraintError()
        }

        return numbers
    }

    protected abstract getComplexity(carries: number[], digitCount: FlashDigit[T]): number

    protected abstract getComplexityThresholdMapKey(digitCount: FlashDigit[T], length: number): ComplexityThresholdMapKey[T]
}

export function getAdditionModeComplexityThresholdMapKey(digitCount: FlashDigit["addition"], length: number): ComplexityThresholdMapKey["addition"] {
    return `${digitCount}-${length}`
}

export function getMultiplicationModeComplexityThresholdMapKey(digitCount: FlashDigit["multiplication"], length: number): ComplexityThresholdMapKey["multiplication"] {
    return `${digitCount[0]}-${digitCount[1]}-${length}`
}

export class AdditionModeCreateNewNumbersAdapter extends AbstractCreateNewNumbersAdapter<"addition"> {
    protected getComplexity(carries: number[], digitCount: FlashDigit["addition"]): number {
        return calculateComplexity(carries.slice(1), digitCount)
    }

    protected getComplexityThresholdMapKey(digitCount: FlashDigit["addition"], length: number): ComplexityThresholdMapKey["addition"] {
        return getAdditionModeComplexityThresholdMapKey(digitCount, length)
    }
}

export class MultiplicationModeCreateNewNumbersAdapter extends AbstractCreateNewNumbersAdapter<"multiplication"> {
    protected getComplexity(carries: number[], digitCount: FlashDigit["multiplication"]): number {
        return calculateComplexity(carries, digitCount[0] * digitCount[1])
    }

    protected getComplexityThresholdMapKey(digitCount: FlashDigit["multiplication"], length: number): ComplexityThresholdMapKey["multiplication"] {
        return getMultiplicationModeComplexityThresholdMapKey(digitCount, length)
    }
}

/**
 * 生成された数字が条件を満たさない場合に返されるエラー
 */
export class CreatedNumbersDoNotSatisfyConstraintError extends Error {
}

export abstract class AbstractCreateRawNumbersAdapter<T extends keyof FlashDigit> implements ExecuteInterface {
    constructor(digitCount: FlashDigit[T], saved: { numbers: Array<FlashDigit[T]>, carries: number[] } = { numbers: [], carries: [] }) {
        this.digitCount = digitCount
        this.numbers = saved.numbers
        this.carries = saved.carries
    }

    getResult(): { numbers: Array<FlashDigit[T]>, carries: number[] } {
        return {
            numbers: this.numbers,
            carries: this.carries,
        }
    }

    protected readonly digitCount: FlashDigit[T]
    // 出題数字
    protected numbers: Array<FlashDigit[T]> = []
    // 繰り上がり回数
    protected carries: number[] = []
    // そろばんオブジェクト
    protected abacus: Abacus = new Abacus(0)

    abstract execute(): void
}

export class AdditionModeEasyDifficultyCreateRawNumbersAdapter extends AbstractCreateRawNumbersAdapter<"addition"> {
    execute(): void {
        let tempAbacusValue: number
        let getIntRetry = 0
        let bestNumber = 0
        let bestCarry = -1
        while (true) {
            const number = getRandomInt(this.digitCount, this.numbers.slice(-1)[0] ?? null, true)

            tempAbacusValue = this.abacus.value
            this.abacus = new Abacus(this.abacus.value).add(number)

            if (this.abacus.carry > this.digitCount) {
                if (this.abacus.carry > bestCarry) {
                    bestNumber = number
                    bestCarry = this.abacus.carry
                }

                this.abacus = new Abacus(tempAbacusValue)

                if (getIntRetry < 100) {
                    getIntRetry++
                    continue
                }

                this.abacus = this.abacus.add(bestNumber)
                this.numbers.push(bestNumber)
                this.carries.push(this.abacus.carry)
                break
            }

            this.numbers.push(number)
            this.carries.push(this.abacus.carry)
            break
        }
    }
}

export class AdditionModeNormalDifficultyCreateRawNumbersAdapter extends AbstractCreateRawNumbersAdapter<"addition"> {
    execute(): void {
        const number = getRandomInt(this.digitCount, this.numbers.slice(-1)[0] ?? null, true)
        this.abacus = new Abacus(this.abacus.value).add(number)
        this.numbers.push(number)
        this.carries.push(this.abacus.carry)
    }
}

export class AdditionModeHardDifficultyCreateRawNumbersAdapter extends AbstractCreateRawNumbersAdapter<"addition"> {
    execute(): void {
        let tempAbacusValue: number
        let getIntRetry = 0
        let bestNumber = 0
        let bestCarry = -1
        while (true) {
            const number = getRandomInt(this.digitCount, this.numbers.slice(-1)[0] ?? null, false)

            tempAbacusValue = this.abacus.value
            this.abacus = new Abacus(this.abacus.value).add(number)

            if (this.numbers.length >= 1 && this.abacus.carry < this.digitCount) {
                if (this.abacus.carry > bestCarry) {
                    bestNumber = number
                    bestCarry = this.abacus.carry
                }

                this.abacus = new Abacus(tempAbacusValue)

                if (getIntRetry < 100) {
                    getIntRetry++
                    continue
                }

                this.abacus = this.abacus.add(bestNumber)
                this.numbers.push(bestNumber)
                this.carries.push(this.abacus.carry)
                break
            }

            this.numbers.push(number)
            this.carries.push(this.abacus.carry)
            break
        }
    }
}

/**
 * たし算モード・難易度未指定
 * 複雑度境界リストの作成に使用する
 */
export class AdditionModeUnknownDifficultyCreateRawNumbersAdapter extends AdditionModeNormalDifficultyCreateRawNumbersAdapter {
}

export class MultiplicationModeEasyDifficultyCreateRawNumbersAdapter extends AbstractCreateRawNumbersAdapter<"multiplication"> {
    execute(): void {
        const number1 = getRandomInt(this.digitCount[0], this.numbers.length > 0 ? this.numbers.slice(-1)[0][0] : null, true)
        const number2 = getRandomInt(this.digitCount[1], this.numbers.length > 0 ? this.numbers.slice(-1)[0][1] : null, true)
        const digits1 = String(number1).split("").reverse().map((n) => {
            return Number(n)
        })
        const digits2 = String(number2).split("").reverse().map((n) => {
            return Number(n)
        })
        for (let p1 = digits1.length - 1; p1 >= 0; p1--) {
            for (let p2 = digits2.length - 1; p2 >= 0; p2--) {
                this.abacus.add(digits1[p1] * digits2[p2] * Math.pow(10, p1 + p2))
            }
        }
        this.numbers.push([number1, number2])
        this.carries.push(this.abacus.carry)
        this.abacus = new Abacus(this.abacus.value)
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
        unknown: AdditionModeUnknownDifficultyCreateRawNumbersAdapter,
    },
    multiplication: {
        easy: MultiplicationModeEasyDifficultyCreateRawNumbersAdapter,
        normal: MultiplicationModeNormalDifficultyCreateRawNumbersAdapter,
        hard: MultiplicationModeHardDifficultyCreateRawNumbersAdapter,
        unknown: MultiplicationModeUnknownDifficultyCreateRawNumbersAdapter,
    },
}

export abstract class AbstractComplexityIsValidAdapter implements ExecuteInterface {
    abstract execute(complexity: Complexity, complexitySchema: ComplexityThreshold): boolean
}

export class AdditionModeEasyDifficultyComplexityIsValidAdapter extends AbstractComplexityIsValidAdapter {
    execute(complexity: Complexity, complexitySchema: ComplexityThreshold): boolean {
        return (complexitySchema.easy <= 0 && complexity <= 0) || // 1 桁 2 口 easy の閾値が 0 であることへの対応
            complexity < complexitySchema.easy
    }
}

export class AdditionModeNormalDifficultyComplexityIsValidAdapter extends AbstractComplexityIsValidAdapter {
    execute(complexity: Complexity, complexitySchema: ComplexityThreshold): boolean {
        return complexity >= complexitySchema.easy &&
            complexity < complexitySchema.hard
    }
}

export class AdditionModeHardDifficultyComplexityIsValidAdapter extends AbstractComplexityIsValidAdapter {
    execute(complexity: Complexity, complexitySchema: ComplexityThreshold): boolean {
        return complexity >= complexitySchema.hard
    }
}

export class MultiplicationModeEasyDifficultyComplexityIsValidAdapter extends AbstractComplexityIsValidAdapter {
    execute(complexity: Complexity, complexitySchema: ComplexityThreshold): boolean {
        return (complexitySchema.easy <= 0 && complexity <= 0) || // 1 桁 2 口 easy の閾値が 0 であることへの対応
            complexity < complexitySchema.easy
    }
}

export class MultiplicationModeNormalDifficultyComplexityIsValidAdapter extends AbstractComplexityIsValidAdapter {
    execute(complexity: Complexity, complexitySchema: ComplexityThreshold): boolean {
        return complexity >= complexitySchema.easy &&
            complexity < complexitySchema.hard
    }
}

export class MultiplicationModeHardDifficultyComplexityIsValidAdapter extends AbstractComplexityIsValidAdapter {
    execute(complexity: Complexity, complexitySchema: ComplexityThreshold): boolean {
        return complexity >= complexitySchema.hard
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
