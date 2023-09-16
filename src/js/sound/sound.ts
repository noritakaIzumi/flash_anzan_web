import { audioAttr } from "../globals.js"
import { Howl } from "howler"
import { flashParamElements } from "../dom/flashParamElements.js"
import { initAudioBuffers } from "./playSound.js"

export const soundExtension = ["ogg", "wav"] as const
export type SoundExtension = typeof soundExtension[number]

export function isMuted(): boolean {
    return flashParamElements.common.isMuted.valueV1
}

const audioObjKey = ["beep", "tick", "answer", "correct", "incorrect", "silence"] as const
export type AudioObjKey = typeof audioObjKey[number]

export type AudioFilename = `${AudioObjKey}.${SoundExtension}`
export type AudioPath = `${string}/${AudioFilename}`

class AudioObj {
    private readonly beep: Howl[] = new Array(0)
    private readonly tick: Howl[] = new Array(0)
    private readonly answer: Howl[] = new Array(1)
    private readonly correct: Howl[] = new Array(1)
    private readonly incorrect: Howl[] = new Array(1)
    private readonly silence: Howl[] = new Array(1)

    load(extension: SoundExtension): void {
        let audioPath: AudioPath
        audioObjKey.forEach(name => {
            audioPath = `${audioAttr.directory}/${name}.${extension}`
            for (let i = 0; i < this[name].length; i++) {
                this[name][i] = new Howl({ src: [audioPath] })
            }
        })
        void initAudioBuffers(extension, "beep")
        void initAudioBuffers(extension, "tick")
    }

    play(name: AudioObjKey): void {
        switch (name) {
            case "answer":
            case "correct":
            case "incorrect":
            case "silence":
                this[name][0].play()
                break
            default:
                throw new Error(`The sound "${name}" cannot play directly`)
        }
    }
}

export const audioObj = new AudioObj()
