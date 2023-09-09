import {audioAttr, flashParamElements} from "./globals";
import {Howl} from "howler";

export const soundExtension = ['ogg', 'wav'] as const;
export type SoundExtension = typeof soundExtension[number];

export function isMuted() {
    return flashParamElements.common.isMuted.valueV1;
}

class AudioObj {
    get beep(): Howl[] {
        return this._beep;
    }

    get tick(): Howl[] {
        return this._tick;
    }

    get answer(): Howl[] {
        return this._answer;
    }

    get correct(): Howl[] {
        return this._correct;
    }

    get incorrect(): Howl[] {
        return this._incorrect;
    }

    get silence(): Howl[] {
        return this._silence;
    }

    private readonly _beep: Howl[] = new Array(2);
    private readonly _tick: Howl[] = new Array(30);
    private readonly _answer: Howl[] = new Array(1);
    private readonly _correct: Howl[] = new Array(1);
    private readonly _incorrect: Howl[] = new Array(1);
    private readonly _silence: Howl[] = new Array(1);

    constructor() {
    }

    load(extension: SoundExtension) {
        let timeoutMs = 100;
        let audioPath = '';
        const loadByName = (name: string) => {
            audioPath = `${audioAttr.directory}/${name}.${extension}`;
            for (let i = 0; i < this[name].length; i++) {
                this[name][i] = new Howl({src: [audioPath]});
                setTimeout(() => {
                    this[name][i].load();
                }, timeoutMs);
                timeoutMs += 50;
            }
        }
        loadByName('beep')
        loadByName('tick')
        loadByName('answer')
        loadByName('correct')
        loadByName('incorrect')
        loadByName('silence')
    }
}

export const audioObj = new AudioObj()
