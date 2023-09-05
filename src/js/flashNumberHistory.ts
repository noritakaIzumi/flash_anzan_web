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

const modes = ['addition', 'multiplication'] as const;
type mode = typeof modes[number];

export class FlashNumberHistoryRegistry {
    protected history: { [key in mode]: FlashNumberHistory<unknown> | null } = {
        addition: null,
        multiplication: null,
    };

    protected validateMode(_mode: string) {
        if (modes.indexOf(_mode as unknown as mode)) {
            throw new RangeError('invalid mode')
        }
    }

    register(_mode: string, digit: unknown, numbers: unknown[]): void {
        this.validateMode(_mode)

        const mapping: {
            [key in mode]: { new(digit: unknown, history: unknown[]): FlashNumberHistory<unknown> }
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
