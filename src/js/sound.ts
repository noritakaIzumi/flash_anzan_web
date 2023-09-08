import {audioAttr, audioObj, flashParamElements} from "./globals";
import {Howl} from "howler";

export const soundExtension = ['ogg', 'wav'] as const;
export type SoundExtension = typeof soundExtension[number];

export function loadAudioObj(extension: string) {
    if ((soundExtension as unknown as string[]).indexOf(extension) === -1) {
        throw new RangeError('invalid extension')
    }

    let timeoutMs = 100;
    let audioPath = '';
    Object.keys(audioObj).forEach((name) => {
        audioPath = `${audioAttr.directory}/${name}.${extension}`;
        for (let i = 0; i < audioObj[name].length; i++) {
            audioObj[name][i] = new Howl({src: [audioPath]});
            setTimeout(() => {
                audioObj[name][i].load();
            }, timeoutMs);
            timeoutMs += 50;
        }
    });
}

export function isMuted() {
    return flashParamElements.common.isMuted.valueV1;
}
