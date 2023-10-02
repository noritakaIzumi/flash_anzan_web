export class IsMutedConfig {
    private _isMuted: boolean = true

    get isMuted(): boolean {
        return this._isMuted
    }

    set isMuted(value: boolean) {
        this._isMuted = value
    }
}

export const isMutedConfig = new IsMutedConfig()
