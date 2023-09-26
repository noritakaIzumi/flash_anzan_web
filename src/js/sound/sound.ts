import { type AudioObjKey, soundExtension, type SoundExtension } from "../globals.js"
import { Howl, type HowlOptions } from "howler"
import { initAudioBuffers } from "./playSound.js"
import { howler2OptionWav } from "../lib/howler2OptionWav.js"
import { howler2OptionOgg } from "../lib/howler2OptionOgg.js"
import { loadStatusManager } from "../loadStatusManager.js"
import { isMutedConfig } from "./isMutedConfig.js"

const howlStore: { [ext in SoundExtension]?: Howl | undefined } = {}

function getHowlOptions(ext: SoundExtension): HowlOptions {
    const optionMap: { [ext in SoundExtension]: HowlOptions } = {
        ogg: howler2OptionOgg,
        wav: howler2OptionWav,
    }
    const option = optionMap[ext]
    option.onload = () => {
        loadStatusManager.markAsLoaded("sound")
    }
    return option
}

function getHowl(extension: SoundExtension): Howl {
    if (howlStore[extension] === undefined) {
        loadStatusManager.resetSoundLoadedStatus()
        howlStore[extension] = new Howl(getHowlOptions(extension))
    }
    return howlStore[extension] as Howl
}

class AudioObj {
    private currentHowl: Howl | undefined

    load(extension: string): void {
        if (!(soundExtension as unknown as string[]).includes(extension)) {
            throw new RangeError("invalid extension")
        }

        const validatedExtension = extension as SoundExtension
        this.currentHowl = getHowl(validatedExtension)
        void initAudioBuffers(validatedExtension, "beep")
        void initAudioBuffers(validatedExtension, "tick")
    }

    play(name: AudioObjKey): void {
        if (isMutedConfig.isMuted) {
            return
        }
        if (this.currentHowl === undefined) {
            throw new Error("audio is not initialized")
        }
        switch (name) {
            case "answer":
            case "correct":
            case "incorrect":
            case "silence":
                this.currentHowl.play(name)
                break
            default:
                throw new Error(`The sound "${name}" cannot play directly`)
        }
    }
}

export const audioObj = new AudioObj()
