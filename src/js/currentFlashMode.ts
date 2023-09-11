import {FlashMode} from "./globals.js";

export class CurrentFlashMode {
    get value(): FlashMode {
        return this._value;
    }

    set value(value: FlashMode) {
        this._value = value;
    }

    private static instance: CurrentFlashMode;
    private _value: FlashMode;

    private constructor(value: FlashMode) {
        this._value = value
    }

    public static getInstance(): CurrentFlashMode {
        if (!CurrentFlashMode.instance) {
            CurrentFlashMode.instance = new CurrentFlashMode('addition')
        }
        return CurrentFlashMode.instance
    }
}

export const currentFlashMode = CurrentFlashMode.getInstance()
