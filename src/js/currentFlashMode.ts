import {FlashMode, flashModes} from "./globals";

export class CurrentFlashMode {
    get value(): FlashMode {
        return this._value;
    }

    set value(value: string) {
        if (flashModes.indexOf(value as unknown as FlashMode) === -1) {
            throw new RangeError('invalid mode')
        }
        this._value = value as FlashMode;
    }

    private static instance: CurrentFlashMode;
    private _value: FlashMode;

    private constructor(value: FlashMode) {
        this.value = value
    }

    public static getInstance(): CurrentFlashMode {
        if (!CurrentFlashMode.instance) {
            CurrentFlashMode.instance = new CurrentFlashMode('addition')
        }
        return CurrentFlashMode.instance
    }
}
