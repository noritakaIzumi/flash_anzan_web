import {audioAttr, audioObj, audioStatus, button, flashParamElements, isMutedMap} from "./globals";
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

export function setMute(on: boolean): void {
    if (on) {
        button.isMuted.checked = true;
        flashParamElements.common.isMuted.value = isMutedMap.on;
        audioStatus.innerHTML = '<i class="bi bi-volume-mute"></i><span class="ps-2">オフ</span>';
    } else {
        button.isMuted.checked = false;
        flashParamElements.common.isMuted.value = isMutedMap.off;
        audioStatus.innerHTML = '<i class="bi bi-volume-up"></i><span class="ps-2">オン</span>';
    }
}

export function muteIsOn() {
    return button.isMuted.checked;
}
