import Crunker from "crunker"
import { type SoundExtension } from "./sound.js"
import { audioAttr } from "../globals.js"

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-expect-error
let crunker: Crunker
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-expect-error
function getCrunkerInstance(): Crunker {
    if (crunker === undefined) {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-expect-error
        crunker = new Crunker()
    }
    return crunker
}

const audioBuffersCollection: { [key in SoundExtension]: AudioBuffer[] } = {
    ogg: [],
    wav: [],
}

async function getAudioBuffers(extension: SoundExtension): Promise<AudioBuffer[]> {
    if (audioBuffersCollection[extension].length <= 0) {
        audioBuffersCollection[extension] = await getCrunkerInstance().fetchAudio(
            `${audioAttr.directory}/beep.${extension}`,
            `${audioAttr.directory}/tick.${extension}`,
            `${audioAttr.directory}/silence.${extension}`
        )
    }
    return audioBuffersCollection[extension]
}

export class PlaySoundCreator {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error
    private readonly crunker: Crunker

    constructor() {
        this.crunker = getCrunkerInstance()
    }

    async create(props: {
        extension: SoundExtension
        beepInterval: number
        toggleTimings: number[]
    }): Promise<PlaySound> {
        const [beepAudioBuffer, tickAudioBuffer, silenceAudioBuffer]: AudioBuffer[] = await getAudioBuffers(props.extension)

        const audios: AudioBuffer[] = []
        audios.push(this.crunker.padAudio(beepAudioBuffer, 0, 0))
        audios.push(this.crunker.padAudio(beepAudioBuffer, 0, props.beepInterval / 1000))
        const beepStart = props.beepInterval * 2 / 1000
        for (const [i, toggleTiming] of props.toggleTimings.entries()) {
            audios.push(this.crunker.padAudio(i % 2 === 0 ? tickAudioBuffer : silenceAudioBuffer, 0, beepStart + toggleTiming / 1000))
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
