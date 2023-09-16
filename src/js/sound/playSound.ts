import { type SoundExtension } from "./sound.js"
import { audioAttr } from "../globals.js"
import { getCrunkerInstance } from "./crunker.js"

const audioBuffersCollection: { [key in SoundExtension]: Array<[AudioBuffer, AudioBuffer]> | undefined } = {
    ogg: undefined,
    wav: undefined,
}

export async function initAudioBuffers(extension: SoundExtension): Promise<void> {
    if (audioBuffersCollection[extension] === undefined) {
        audioBuffersCollection[extension] = await getCrunkerInstance().fetchAudio(
            `${audioAttr.directory}/beep.${extension}`,
            `${audioAttr.directory}/tick.${extension}`
        )
    }
}

async function getAudioBuffers(extension: SoundExtension): Promise<Array<[AudioBuffer, AudioBuffer]>> {
    await initAudioBuffers(extension)
    return audioBuffersCollection[extension] as Array<[AudioBuffer, AudioBuffer]>
}

export class PlaySoundCreator {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error
    private readonly crunker: Crunker

    constructor() {
        this.crunker = getCrunkerInstance()
    }

    async create(props: {
        soundExtension: SoundExtension
        beepInterval: number
        toggleTimings: number[]
    }): Promise<PlaySound> {
        const [beepAudioBuffer, tickAudioBuffer]: Array<[AudioBuffer, AudioBuffer]> = await getAudioBuffers(props.soundExtension)

        const audios: AudioBuffer[] = []
        audios.push(this.crunker.padAudio(beepAudioBuffer, 0, 0))
        audios.push(this.crunker.padAudio(beepAudioBuffer, 0, props.beepInterval / 1000))
        const beepStart = props.beepInterval * 2 / 1000
        for (const [i, toggleTiming] of props.toggleTimings.entries()) {
            if (i % 2 === 0) {
                audios.push(this.crunker.padAudio(tickAudioBuffer, 0, beepStart + toggleTiming / 1000))
            }
        }

        return new PlaySound(this.crunker.mergeAudio(audios))
    }
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
        this.crunker.play(this.buffer)
    }
}
