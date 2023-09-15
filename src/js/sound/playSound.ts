import Crunker from "crunker"
import { type AudioPath, type SoundExtension } from "./sound.js"
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
        const beepAudioPath: AudioPath = `${audioAttr.directory}/beep.${props.extension}`
        const tickAudioPath: AudioPath = `${audioAttr.directory}/tick.${props.extension}`
        const silenceAudioPath: AudioPath = `${audioAttr.directory}/silence.${props.extension}`

        const [beepAudioBuffer, tickAudioBuffer, silenceAudioBuffer]: AudioBuffer[] = await this.crunker.fetchAudio(beepAudioPath, tickAudioPath, silenceAudioPath)

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
