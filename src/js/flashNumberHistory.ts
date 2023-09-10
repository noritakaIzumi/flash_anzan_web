import {FlashDigit, FlashMode, flashModes} from "./globals.js";

export abstract class FlashNumberHistory<T> {
    protected get digit(): T {
        return this._digit;
    }

    get numberHistory(): T[] {
        return this._numberHistory;
    }

    private readonly _digit: T;
    private readonly _numberHistory: T[];

    constructor(digit: T, numberHistory: T[]) {
        this._digit = digit
        this._numberHistory = numberHistory
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

    protected history: { [key in FlashMode]: FlashNumberHistory<FlashDigit[key]> | null } = {
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

    register(mode: "addition", digit: number, numbers: number[]): void
    register(mode: "multiplication", digit: [number, number], numbers: [number, number][]): void
    register(mode: FlashMode, digit: number & [number, number], numbers: number[] & [number, number][]): void {
        switch (mode) {
            case "addition":
                this.history.addition = new AdditionModeFlashNumberHistory(digit, numbers)
                break;
            case "multiplication":
                this.history.multiplication = new MultiplicationModeFlashNumberHistory(digit, numbers)
                break;
        }
    }

    getHistory<TMode extends FlashMode>(mode: TMode): FlashNumberHistory<FlashDigit[TMode]> | null {
        this.validateMode(mode)
        return this.history[mode]
    }
}

export const flashNumberHistoryRegistry = FlashNumberHistoryRegistry.getInstance()
