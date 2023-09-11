import {FlashDigit, FlashMode} from "../globals.js";
import {FlashAnswer} from "./flashNumbers.js";

export abstract class FlashNumberHistory<T> {
    protected get digit(): T {
        return this._digit;
    }

    get numberHistory(): T[] {
        return this._numberHistory;
    }

    get answer(): FlashAnswer {
        return this._answer;
    }

    private readonly _digit: T;
    private readonly _numberHistory: T[];
    private readonly _answer: FlashAnswer;

    constructor(digit: T, numberHistory: T[], answer: FlashAnswer) {
        this._digit = digit
        this._numberHistory = numberHistory
        this._answer = answer
    }

    public abstract digitEquals(digit: T): boolean;
}

export class AdditionModeFlashNumberHistory extends FlashNumberHistory<FlashDigit["addition"]> {
    digitEquals(digit: number): boolean {
        return digit === this.digit
    }
}

export class MultiplicationModeFlashNumberHistory extends FlashNumberHistory<FlashDigit["multiplication"]> {
    digitEquals(digit: [number, number]): boolean {
        return digit[0] === this.digit[0] && digit[1] === this.digit[1]
    }
}

export abstract class AbstractFlashNumberHistoryRegistry<T extends FlashMode, TDigit = FlashDigit[T]> {
    protected history: FlashNumberHistory<TDigit> | null = null

    abstract register(digit: TDigit, numbers: TDigit[], answer: FlashAnswer): void;

    getHistory(): FlashNumberHistory<TDigit> | null {
        return this.history
    }
}

export class AdditionModeFlashNumberHistoryRegistry extends AbstractFlashNumberHistoryRegistry<"addition"> {
    register(digit: FlashDigit["addition"], numbers: FlashDigit["addition"][], answer: FlashAnswer): void {
        this.history = new AdditionModeFlashNumberHistory(digit, numbers, answer)
    }
}

export class MultiplicationModeFlashNumberHistoryRegistry extends AbstractFlashNumberHistoryRegistry<"multiplication"> {
    register(digit: FlashDigit["multiplication"], numbers: FlashDigit["multiplication"][], answer: FlashAnswer): void {
        this.history = new MultiplicationModeFlashNumberHistory(digit, numbers, answer)
    }
}

export const _flashNumberHistoryRegistry: Readonly<{ [key in FlashMode]: AbstractFlashNumberHistoryRegistry<key> }> = {
    addition: new AdditionModeFlashNumberHistoryRegistry(),
    multiplication: new MultiplicationModeFlashNumberHistoryRegistry(),
}
