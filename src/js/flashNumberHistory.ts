import {FlashMode, flashModes} from "./globals";

abstract class FlashNumberHistory<T> {
    private set digit(value: T) {
        this._digit = value;
    }

    private set numberHistory(value: T[]) {
        this._numberHistory = value;
    }

    protected get digit(): T {
        return this._digit;
    }

    get numberHistory(): T[] {
        return this._numberHistory;
    }

    private _digit: T;
    private _numberHistory: T[];

    constructor(digit: T, numberHistory: T[]) {
        this.digit = digit
        this.numberHistory = numberHistory
    }

    public abstract digitEquals(digit: T): boolean;
}

export class AdditionModeFlashNumberHistory extends FlashNumberHistory<number> {
    digitEquals(digit: number): boolean {
        return digit === this.digit
    }
}

export class MultiplicationModeFlashNumberHistory extends FlashNumberHistory<[number, number]> {
    digitEquals(digit: [number, number]): boolean {
        return digit[0] === this.digit[0] && digit[1] === this.digit[1]
    }
}

export class FlashNumberHistoryRegistry {
    private static instance: FlashNumberHistoryRegistry

    protected history: { [key in FlashMode]: FlashNumberHistory<unknown> | null } = {
        addition: null,
        multiplication: null,
    };

    public static getInstance() {
        if (!FlashNumberHistoryRegistry.instance) {
            FlashNumberHistoryRegistry.instance = new FlashNumberHistoryRegistry()
        }
        return FlashNumberHistoryRegistry.instance
    }

    private constructor() {
    }

    protected validateMode(_mode: string) {
        if (flashModes.indexOf(_mode as unknown as FlashMode) === -1) {
            throw new RangeError('invalid mode')
        }
    }

    register(_mode: string, digit: unknown, numbers: unknown[]): void {
        this.validateMode(_mode)

        const mapping: {
            [key in FlashMode]: { new(digit: unknown, history: unknown[]): FlashNumberHistory<unknown> }
        } = {
            addition: AdditionModeFlashNumberHistory,
            multiplication: MultiplicationModeFlashNumberHistory,
        }
        this.history[_mode] = new mapping[_mode](digit, numbers)
    }

    getHistory(_mode: string): FlashNumberHistory<unknown> | null {
        this.validateMode(_mode)
        return this.history[_mode]
    }
}
