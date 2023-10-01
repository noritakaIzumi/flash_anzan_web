import { type FlashDifficulty, type SoundExtension } from "../globals.js"

export interface FlashNumberParamSchema {
    min: number
    max: number
    default: number
}

export type FlashNumberParamWithDifficultySupportSchema = FlashNumberParamSchema & { difficultySupportMax: number }

export interface FlashDifficultyParamSchema {
    default: FlashDifficulty
}

export interface FlashIsMutedParamSchema {
    default: boolean
}

export interface FlashSoundExtensionParamSchema {
    default: SoundExtension
}

export interface FlashCheckboxParamSchema {
    default: boolean
}

export interface FlashParamSchema {
    addition: {
        digit: FlashNumberParamWithDifficultySupportSchema
        length: FlashNumberParamWithDifficultySupportSchema
        time: FlashNumberParamSchema
    }
    multiplication: {
        digit1: FlashNumberParamWithDifficultySupportSchema
        digit2: FlashNumberParamWithDifficultySupportSchema
        length: FlashNumberParamWithDifficultySupportSchema
        time: FlashNumberParamSchema
    }
    common: {
        difficulty: FlashDifficultyParamSchema
        flashRate: FlashNumberParamSchema
        offset: FlashNumberParamSchema
        isMuted: FlashIsMutedParamSchema
        soundExtension: FlashSoundExtensionParamSchema
        fixNumberInterval: FlashCheckboxParamSchema
        hideAnswer: FlashCheckboxParamSchema
    }
}
