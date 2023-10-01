import { audioAttr, type AudioObjKey, type AudioPath, type SoundExtension } from '../globals.js'
import { getCrunkerInstance } from './crunker.js'
import { isMutedConfig } from './isMutedConfig.js'

const audioBuffersRegistry: { [name in AudioObjKey]?: AudioBuffer } = {}

export async function initAudioBuffers(extension: SoundExtension, name: AudioObjKey): Promise<void> {
    const audioFilename: AudioPath = `${audioAttr.directory}/${name}.${extension}`
    const audioBuffers: AudioBuffer | undefined = (await getCrunkerInstance().fetchAudio(audioFilename)).pop()
    if (audioBuffers === undefined) {
        throw new Error(`failed to fetch audio: (ext: ${extension}, name: ${name})`)
    }
    audioBuffersRegistry[name] = audioBuffers
}

async function getAudioBuffers(name: AudioObjKey): Promise<AudioBuffer> {
    const audioBuffer = audioBuffersRegistry[name]
    if (audioBuffer === undefined) {
        throw new Error('audio is not initialized')
    }
    return audioBuffersRegistry[name] as AudioBuffer
}

export class PlaySoundCreator {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error
    private readonly crunker: Crunker

    constructor() {
        this.crunker = getCrunkerInstance()
    }

    async createBeep(props: { beepInterval: number, beepCount: number }): Promise<PlaySound> {
        const beepAudioBuffer = await getAudioBuffers('beep')

        const audios: AudioBuffer[] = []
        for (let i = 0; i < props.beepCount; i++) {
            audios.push(this.crunker.padAudio(beepAudioBuffer, 0, (props.beepInterval * i) / 1000))
        }

        return new PlaySound(this.crunker.mergeAudio(audios))
    }

    async createTick(props: { toggleTimings: number[] }): Promise<PlaySound> {
        const tickAudioBuffer = await getAudioBuffers('tick')

        const audios: AudioBuffer[] = []
        for (const [i, toggleTiming] of props.toggleTimings.entries()) {
            if (i % 2 === 0) {
                audios.push(this.crunker.padAudio(tickAudioBuffer, 0, toggleTiming / 1000))
            }
        }

        return new PlaySound(this.crunker.mergeAudio(audios))
    }
}

let playSoundCreator: PlaySoundCreator | undefined

export function getPlaySoundCreator(): PlaySoundCreator {
    if (playSoundCreator === undefined) {
        playSoundCreator = new PlaySoundCreator()
    }
    return playSoundCreator
}

export class PlaySound {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error
    private readonly crunker: Crunker
    private readonly buffer: AudioBuffer

    constructor(buffer: AudioBuffer) {
        this.crunker = getCrunkerInstance()
        this.buffer = buffer
    }

    play(): void {
        if (isMutedConfig.isMuted) {
            return
        }
        this.crunker.play(this.buffer)
    }
}
