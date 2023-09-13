import {type FlashDigit, type FlashMode} from '../globals.js'
import {type FlashAnswer, type FlashNumbers} from './flashNumbers.js'

export abstract class FlashNumberHistory<T> {
    protected get digit(): T {
        return this._digit
    }

    get numberHistory(): FlashNumbers<T> {
        return this._numberHistory
    }

    get answer(): FlashAnswer {
        return this._answer
    }

    private readonly _digit: T
    private readonly _numberHistory: FlashNumbers<T>
    private readonly _answer: FlashAnswer

    constructor(digit: T, numberHistory: FlashNumbers<T>, answer: FlashAnswer) {
        this._digit = digit
        this._numberHistory = numberHistory
        this._answer = answer
    }

    public abstract digitEquals(digit: T): boolean
}

export class AdditionModeFlashNumberHistory extends FlashNumberHistory<FlashDigit['addition']> {
    digitEquals(digit: number): boolean {
        return digit === this.digit
    }
}

export class MultiplicationModeFlashNumberHistory extends FlashNumberHistory<FlashDigit['multiplication']> {
    digitEquals(digit: [number, number]): boolean {
        return digit[0] === this.digit[0] && digit[1] === this.digit[1]
    }
}

// latest flash number history を更新するためのトークン。export しないことでこのファイル内のクラスからしか書き込めなくなる。
class LatestFlashNumberHistoryWriteToken {
    private used: boolean = false

    use(): void {
        if (this.used) {
            throw new Error('token is already used')
        }
        this.used = true
    }
}

export class LatestFlashNumberHistory {
    private static instance: LatestFlashNumberHistory

    public static getInstance() {
        if (!LatestFlashNumberHistory.instance) {
            LatestFlashNumberHistory.instance = new LatestFlashNumberHistory()
        }
        return LatestFlashNumberHistory.instance
    }

    private constructor() {
    }

    get history(): FlashNumberHistory<any> | null {
        return this._history
    }

    private _history: FlashNumberHistory<any> | null = null

    setHistory(history: FlashNumberHistory<any>, token: LatestFlashNumberHistoryWriteToken) {
        token.use()
        this._history = history
    }
}

export const latestFlashNumberHistory = LatestFlashNumberHistory.getInstance()

export abstract class AbstractFlashNumberHistoryRegistry<T extends FlashMode, TDigit = FlashDigit[T]> {
    protected set history(value: FlashNumberHistory<TDigit>) {
        this._history = value
        latestFlashNumberHistory.setHistory(this._history, new LatestFlashNumberHistoryWriteToken())
    }

    private _history: FlashNumberHistory<TDigit> | null = null

    abstract register(digit: TDigit, numbers: FlashNumbers<FlashDigit[T]>, answer: FlashAnswer): void

    getHistory(): FlashNumberHistory<TDigit> | null {
        return this._history
    }
}

export class AdditionModeFlashNumberHistoryRegistry extends AbstractFlashNumberHistoryRegistry<'addition'> {
    register(digit: FlashDigit['addition'], numbers: FlashNumbers<FlashDigit['addition']>, answer: FlashAnswer): void {
        this.history = new AdditionModeFlashNumberHistory(digit, numbers, answer)
    }
}

export class MultiplicationModeFlashNumberHistoryRegistry extends AbstractFlashNumberHistoryRegistry<'multiplication'> {
    register(digit: FlashDigit['multiplication'], numbers: FlashNumbers<FlashDigit['multiplication']>, answer: FlashAnswer): void {
        this.history = new MultiplicationModeFlashNumberHistory(digit, numbers, answer)
    }
}

export const flashNumberHistoryRegistry: Readonly<{ [key in FlashMode]: AbstractFlashNumberHistoryRegistry<key> }> = {
    addition: new AdditionModeFlashNumberHistoryRegistry(),
    multiplication: new MultiplicationModeFlashNumberHistoryRegistry()
}
