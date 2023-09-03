import {numberHistoryStringifyDelimiter} from "./globals";

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

    constructor(history: string) {
        const parsed = this.parse(history)
        this.digit = parsed.digit
        this.numberHistory = parsed.numberHistory
    }

    protected abstract parse(history: string): { digit: T, numberHistory: T[] };

    public abstract digitIs(digit: T): boolean;
}

export class AdditionModeFlashNumberHistory extends FlashNumberHistory<number> {
    protected parse(history: string): { digit: number; numberHistory: number[] } {
        const asString = history.split(numberHistoryStringifyDelimiter)
        return {
            digit: asString[0].length,
            numberHistory: asString.map(n => Number(n)),
        }
    }

    digitIs(digit: number): boolean {
        return digit === this.digit
    }
}

export class MultiplicationModeFlashNumberHistory extends FlashNumberHistory<[number, number]> {
    protected parse(history: string): { digit: [number, number]; numberHistory: [number, number][] } {
        const asString = history.split(numberHistoryStringifyDelimiter).map(number => number.split(','));

        if (asString[0][1]) {
            return {
                digit: [asString[0][0].length, asString[0][1].length],
                numberHistory: asString.map(p => {
                    if (p.length !== 2) {
                        throw new TypeError('invalid number history');
                    }
                    return [Number(p[0]), Number(p[1])]
                })
            }
        } else {
            return {
                digit: [0, 0],
                numberHistory: [],
            }
        }
    }

    digitIs(digit: [number, number]): boolean {
        return digit[0] === this.digit[0] && digit[1] === this.digit[1]
    }
}
