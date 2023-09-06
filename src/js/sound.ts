import {audioAttr, audioObj, audioStatus, audioStatusInnerHtmlMap, isMuted, isMutedMap} from "./globals";
import {Howl} from "howler";

const soundExtension = ['ogg', 'wav'] as const;

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

export function toggleMute() {
    if (isMuted.checked || isMuted.value === isMutedMap.on) {
        isMuted.checked = true;
        isMuted.value = isMutedMap.on;
        audioStatus.innerHTML = audioStatusInnerHtmlMap.off;
    } else {
        isMuted.checked = false;
        isMuted.value = isMutedMap.off;
        audioStatus.innerHTML = audioStatusInnerHtmlMap.on;
    }
}

export function muteIsOn() {
    return isMuted.checked;
}
