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
import { type FlashParamSet } from "./flashParamSet.js"
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

    execute(requestParam: FlashParamSet<T>, options: FlashOptions = {}): Flash<T> {
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

interface CreateRawNumberState<T extends keyof FlashDigit> {
    numbers: Array<FlashDigit[T]>
    carries: number[]
    abacus: Abacus
}

interface AbstractCreateRawNumberAdapterConstructorArgs<T extends keyof FlashDigit> {
    digitCount: FlashDigit[T]
    saved?: CreateRawNumberState<T> | undefined
}

type CreateRawNumberAdapterMapByMode<T extends FlashMode> = {
    [key in FlashDifficulty | UnknownFlashDifficulty]: new(args: AbstractCreateRawNumberAdapterConstructorArgs<T>) => AbstractCreateRawNumberAdapter<T>
}
type ComplexityIsValidAdapterMapByMode = {
    [key in FlashDifficulty]: new() => AbstractComplexityIsValidAdapter
}

export abstract class AbstractCreateNewNumbersAdapter<T extends FlashMode> implements ExecuteInterface {
    protected createRawNumberAdaptersByMode: CreateRawNumberAdapterMapByMode<T>
    protected complexityIsValidAdaptersByMode: ComplexityIsValidAdapterMapByMode
    protected complexityThresholdMapByMode: ComplexityThresholdMapByMode<T>
    protected difficultySupportMaxLength: number

    constructor(
        {
            createRawNumberAdapterMapByMode,
            complexityIsValidAdapterMapByMode,
            complexityThresholdMapByMode,
            difficultySupportMaxLength,
        }: {
            createRawNumberAdapterMapByMode: CreateRawNumberAdapterMapByMode<T>
            complexityIsValidAdapterMapByMode: ComplexityIsValidAdapterMapByMode
            complexityThresholdMapByMode: ComplexityThresholdMapByMode<T>
            difficultySupportMaxLength: number
        }
    ) {
        this.createRawNumberAdaptersByMode = createRawNumberAdapterMapByMode
        this.complexityIsValidAdaptersByMode = complexityIsValidAdapterMapByMode
        this.complexityThresholdMapByMode = complexityThresholdMapByMode
        this.difficultySupportMaxLength = difficultySupportMaxLength
    }

    execute(digitCount: FlashDigit[T], length: number, difficulty: FlashDifficulty, options: FlashOptions): Array<FlashDigit[T]> {
        const complexityThresholdMapLengthKey = Math.min(length, this.difficultySupportMaxLength)
        const complexityThresholdMapKey = this.getComplexityThresholdMapKey(digitCount, complexityThresholdMapLengthKey)
        const complexityThreshold = this.complexityThresholdMapByMode[complexityThresholdMapKey]

        if (complexityThreshold === undefined) {
            if (options.allowUnknownDifficulty ?? false) {
                // eslint-disable-next-line new-cap
                const createRawNumberAdapter = new this.createRawNumberAdaptersByMode.unknown({ digitCount })
                for (let _ = 0; _ < length; _++) {
                    createRawNumberAdapter.execute()
                }
                return createRawNumberAdapter.getResult().numbers
            }
            throw new RangeError(`complexity threshold not found at key: (digit: ${JSON.stringify(digitCount)}, length: ${length})`)
        }

        const firstCreateLength = complexityThresholdMapLengthKey
        const createRawNumberAdapter = new this.createRawNumberAdaptersByMode[difficulty]({ digitCount })
        for (let _ = 0; _ < firstCreateLength; _++) {
            createRawNumberAdapter.execute()
        }
        const result = createRawNumberAdapter.getResult()
        const numbers = result.numbers
        const carries = result.carries
        const complexity = this.getComplexity(carries, digitCount)
        const complexityIsValid = new this.complexityIsValidAdaptersByMode[difficulty]().execute(complexity, complexityThreshold)
        if (!complexityIsValid) {
            throw new CreatedNumbersDoNotSatisfyConstraintError()
        }

        if (length <= this.difficultySupportMaxLength) {
            return numbers
        }

        /*
         * 難易度サポートされている口数を超える場合は、n 口目からの最大サポート口数についてフラッシュ複雑度を判定する
         *
         * ex. サポート最大口数が 30 口で 32 口作成する場合、
         * - 2 口目から 31 口目の 30 口でフラッシュ複雑度を判定し、
         * - 3 口目から 32 口目の 30 口でフラッシュ複雑度を判定する。
         */

        let abacus = result.abacus

        const createExtraNumber = (start: number, abacus: Abacus): CreateRawNumberState<T> => {
            let retry = 0
            while (retry < generateNumbersRetryLimit) {
                const createRawNumberAdapter = new this.createRawNumberAdaptersByMode[difficulty]({
                    digitCount,
                    saved: { numbers: numbers.slice(start + 1), carries: carries.slice(start + 1), abacus },
                })
                createRawNumberAdapter.execute()
                const result = createRawNumberAdapter.getResult()
                const complexity = this.getComplexity(result.carries, digitCount)
                const complexityIsValid = new this.complexityIsValidAdaptersByMode[difficulty]().execute(complexity, complexityThreshold)
                if (complexityIsValid) {
                    return {
                        numbers: result.numbers.slice(-1),
                        carries: result.carries.slice(-1),
                        abacus: result.abacus,
                    }
                }
                retry++
            }
            throw new CreatedNumbersDoNotSatisfyConstraintError()
        }

        const extraCreateLength = length - this.difficultySupportMaxLength
        for (let i = 0; i < extraCreateLength; i++) {
            const extraResult = createExtraNumber(i, abacus)
            numbers.push(...extraResult.numbers)
            carries.push(...extraResult.carries)
            abacus = extraResult.abacus
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
        return calculateComplexity(carries, digitCount)
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

export abstract class AbstractCreateRawNumberAdapter<T extends keyof FlashDigit> implements ExecuteInterface {
    protected readonly digitCount: FlashDigit[T]
    // 出題数字
    protected numbers: Array<FlashDigit[T]>
    // 繰り上がり回数
    protected carries: number[]
    // そろばんオブジェクト
    protected abacus: Abacus

    constructor(args: AbstractCreateRawNumberAdapterConstructorArgs<T>) {
        this.digitCount = args.digitCount
        this.numbers = args.saved === undefined ? [] : args.saved.numbers
        this.carries = args.saved === undefined ? [] : args.saved.carries
        this.abacus = args.saved === undefined ? new Abacus(0) : args.saved.abacus
    }

    getResult(): CreateRawNumberState<T> {
        return {
            numbers: this.numbers,
            carries: this.carries,
            abacus: this.abacus,
        }
    }

    abstract execute(): void
}

export abstract class AbstractAdditionModeCreateRawNumberAdapter extends AbstractCreateRawNumberAdapter<"addition"> {
    abstract execute(): void

    protected register(number: FlashDigit["addition"], carry: number): void {
        // 最初の数字を追加するときは繰り上がりは必ず 0 なので登録しない
        if (this.numbers.length > 0) {
            this.carries.push(carry)
        }
        this.numbers.push(number)
    }
}

export class AdditionModeEasyDifficultyCreateRawNumberAdapter extends AbstractAdditionModeCreateRawNumberAdapter {
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
                this.register(bestNumber, this.abacus.carry)
                break
            }

            this.register(number, this.abacus.carry)
            break
        }
    }
}

export class AdditionModeNormalDifficultyCreateRawNumberAdapter extends AbstractAdditionModeCreateRawNumberAdapter {
    execute(): void {
        const number = getRandomInt(this.digitCount, this.numbers.slice(-1)[0] ?? null, true)
        this.abacus = new Abacus(this.abacus.value).add(number)
        this.register(number, this.abacus.carry)
    }
}

export class AdditionModeHardDifficultyCreateRawNumberAdapter extends AbstractAdditionModeCreateRawNumberAdapter {
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
                this.register(bestNumber, this.abacus.carry)
                break
            }

            this.register(number, this.abacus.carry)
            break
        }
    }
}

/**
 * たし算モード・難易度未指定
 * 複雑度境界リストの作成に使用する
 */
export class AdditionModeUnknownDifficultyCreateRawNumberAdapter extends AdditionModeNormalDifficultyCreateRawNumberAdapter {
}

export class MultiplicationModeEasyDifficultyCreateRawNumberAdapter extends AbstractCreateRawNumberAdapter<"multiplication"> {
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

export class MultiplicationModeNormalDifficultyCreateRawNumberAdapter extends MultiplicationModeEasyDifficultyCreateRawNumberAdapter {
}

export class MultiplicationModeHardDifficultyCreateRawNumberAdapter extends MultiplicationModeEasyDifficultyCreateRawNumberAdapter {
}

/**
 * かけ算モード・難易度未指定
 * 複雑度境界リストの作成に使用する
 */
export class MultiplicationModeUnknownDifficultyCreateRawNumberAdapter extends MultiplicationModeEasyDifficultyCreateRawNumberAdapter {
}

export type CreateRawNumberAdapterMap = { [mode in FlashMode]: CreateRawNumberAdapterMapByMode<mode> }
export const createRawNumberAdapterMap: CreateRawNumberAdapterMap = {
    addition: {
        easy: AdditionModeEasyDifficultyCreateRawNumberAdapter,
        normal: AdditionModeNormalDifficultyCreateRawNumberAdapter,
        hard: AdditionModeHardDifficultyCreateRawNumberAdapter,
        unknown: AdditionModeUnknownDifficultyCreateRawNumberAdapter,
    },
    multiplication: {
        easy: MultiplicationModeEasyDifficultyCreateRawNumberAdapter,
        normal: MultiplicationModeNormalDifficultyCreateRawNumberAdapter,
        hard: MultiplicationModeHardDifficultyCreateRawNumberAdapter,
        unknown: MultiplicationModeUnknownDifficultyCreateRawNumberAdapter,
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
