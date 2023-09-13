import { audioAttr } from './globals.js'
import { Howl } from 'howler'
import { flashParamElements } from './dom/flashParamElements.js'
import { flashParamSchema } from './flash/flashParamSchema.js'

export const soundExtension = ['ogg', 'wav'] as const
export type SoundExtension = typeof soundExtension[number]

export function isMuted(): boolean {
    return flashParamElements.common.isMuted.valueV1
}

const audioObjKey = ['beep', 'tick', 'answer', 'correct', 'incorrect', 'silence'] as const
type AudioObjKey = typeof audioObjKey[number]

type AudioObjInterface = {
    [key in AudioObjKey]: Howl[]
}

const tickSoundLength = Math.max(flashParamSchema.addition.length.max, flashParamSchema.multiplication.length.max)

class AudioObj implements AudioObjInterface {
    get beep(): Howl[] {
        return this._beep
    }

    get tick(): Howl[] {
        return this._tick
    }

    get answer(): Howl[] {
        return this._answer
    }

    get correct(): Howl[] {
        return this._correct
    }

    get incorrect(): Howl[] {
        return this._incorrect
    }

    get silence(): Howl[] {
        return this._silence
    }

    private readonly _beep: Howl[] = new Array(2)
    private readonly _tick: Howl[] = new Array(tickSoundLength)
    private readonly _answer: Howl[] = new Array(1)
    private readonly _correct: Howl[] = new Array(1)
    private readonly _incorrect: Howl[] = new Array(1)
    private readonly _silence: Howl[] = new Array(1)

    load(extension: SoundExtension): void {
        let timeoutMs = 100
        let audioPath = ''
        audioObjKey.forEach(name => {
            audioPath = `${audioAttr.directory}/${name}.${extension}`
            for (let i = 0; i < this[name].length; i++) {
                this[name][i] = new Howl({ src: [audioPath] })
                setTimeout(() => {
                    this[name][i].load()
                }, timeoutMs)
                timeoutMs += 50
            }
        })
    }
}

export const audioObj = new AudioObj()
