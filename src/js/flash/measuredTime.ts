export class MeasuredTime {
    get start(): number {
        return this._start
    }

    set start(value: number) {
        this._start = value
    }

    get end(): number {
        return this._end
    }

    set end(value: number) {
        this._end = value
    }

    private _start: number
    private _end: number

    constructor() {
        this._start = 0
        this._end = 0
    }

    reset(): void {
        this._start = 0
        this._end = 0
    }
}

export const measuredTime = new MeasuredTime()
