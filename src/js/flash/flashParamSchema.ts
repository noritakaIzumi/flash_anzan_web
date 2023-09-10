import {FlashDifficulty} from "../globals.js";
import {SoundExtension} from "../sound.js";

export type FlashNumberParamSchema = {
    min: number,
    max: number,
    default: number,
}
export type FlashDifficultyParamSchema = {
    default: FlashDifficulty,
}
export type FlashIsMutedParamSchema = {
    default: boolean
};
export type FlashSoundExtensionParamSchema = {
    default: SoundExtension
};
export type FlashParamSchema = {
    addition: {
        digit: FlashNumberParamSchema
        length: FlashNumberParamSchema
        time: FlashNumberParamSchema
    }
    multiplication: {
        digit1: FlashNumberParamSchema
        digit2: FlashNumberParamSchema
        length: FlashNumberParamSchema
        time: FlashNumberParamSchema
    }
    common: {
        difficulty: FlashDifficultyParamSchema
        flashRate: FlashNumberParamSchema
        offset: FlashNumberParamSchema
        isMuted: FlashIsMutedParamSchema
        soundExtension: FlashSoundExtensionParamSchema
    }
}
export const flashParamSchema: FlashParamSchema = {
    addition: {
        digit: {min: 1, max: 14, default: 1},
        length: {min: 2, max: 30, default: 3},
        time: {min: 1000, max: 30000, default: 5000},
    },
    multiplication: {
        digit1: {min: 1, max: 7, default: 1},
        digit2: {min: 1, max: 7, default: 1},
        length: {min: 2, max: 30, default: 2},
        time: {min: 1000, max: 30000, default: 5000},
    },
    common: {
        difficulty: {default: 'easy'},
        flashRate: {min: 1, max: 99, default: 55},
        offset: {min: -500, max: 500, default: 0},
        isMuted: {default: false},
        soundExtension: {default: 'wav'},
    },
}
