import { type AudioObjKey, type AudioPath, type SoundExtension } from "./sound.js"
import { audioAttr } from "../globals.js"
import { getCrunkerInstance } from "./crunker.js"

const audioBuffersRegistry: { [ext in SoundExtension]: { [name in AudioObjKey]?: AudioBuffer } } = {
    ogg: {},
    wav: {},
}

export async function initAudioBuffers(extension: SoundExtension, name: AudioObjKey): Promise<void> {
    if (audioBuffersRegistry[extension][name] === undefined) {
        const audioFilename: AudioPath = `${audioAttr.directory}/${name}.${extension}`
        const audioBuffers: AudioBuffer | undefined = (await getCrunkerInstance().fetchAudio(audioFilename)).pop()
        if (audioBuffers === undefined) {
            throw new Error(`failed to fetch audio: (ext: ${extension}, name: ${name})`)
        }
        audioBuffersRegistry[extension][name] = audioBuffers
    }
}

async function getAudioBuffers(extension: SoundExtension, name: AudioObjKey): Promise<AudioBuffer> {
    await initAudioBuffers(extension, name)
    return audioBuffersRegistry[extension][name] as AudioBuffer
}

export class PlaySoundCreator {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error
    private readonly crunker: Crunker

    constructor() {
        this.crunker = getCrunkerInstance()
    }

    async createBeep(props: {
        soundExtension: SoundExtension
        beepInterval: number
        beepCount: number
    }): Promise<PlaySound> {
        const beepAudioBuffer = await getAudioBuffers(props.soundExtension, "beep")

        const audios: AudioBuffer[] = []
        for (let i = 0; i < props.beepCount; i++) {
            audios.push(this.crunker.padAudio(beepAudioBuffer, 0, props.beepInterval * i / 1000))
        }

        return new PlaySound(this.crunker.mergeAudio(audios))
    }

    async createTick(props: {
        soundExtension: SoundExtension
        toggleTimings: number[]
    }): Promise<PlaySound> {
        const tickAudioBuffer = await getAudioBuffers(props.soundExtension, "tick")

        const audios: AudioBuffer[] = []
        for (const [i, toggleTiming] of props.toggleTimings.entries()) {
            if (i % 2 === 0) {
                audios.push(this.crunker.padAudio(tickAudioBuffer, 0, toggleTiming / 1000))
            }
        }

        return new PlaySound(this.crunker.mergeAudio(audios))
    }
}

export const playSoundCreator = new PlaySoundCreator()

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
        this.crunker.play(this.buffer)
    }
}
