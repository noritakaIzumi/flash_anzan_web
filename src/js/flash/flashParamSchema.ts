import { type FlashDifficulty } from '../globals.js'
import { type SoundExtension } from '../sound.js'

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
    }
}

export const flashParamSchema: FlashParamSchema = {
    addition: {
        digit: {
            min: 1,
            max: 14,
            default: 1,
            difficultySupportMax: 6,
        },
        length: {
            min: 2,
            max: 30,
            default: 3,
            difficultySupportMax: 30,
        },
        time: {
            min: 1_000,
            max: 30_000,
            default: 5_000,
        },
    },
    multiplication: {
        digit1: {
            min: 1,
            max: 7,
            default: 1,
            difficultySupportMax: 3,
        },
        digit2: {
            min: 1,
            max: 7,
            default: 1,
            difficultySupportMax: 3,
        },
        length: {
            min: 2,
            max: 30,
            default: 2,
            difficultySupportMax: 30,
        },
        time: {
            min: 1_000,
            max: 30_000,
            default: 5_000,
        },
    },
    common: {
        difficulty: { default: 'easy' },
        flashRate: {
            min: 1,
            max: 99,
            default: 55,
        },
        offset: {
            min: -500,
            max: 500,
            default: 0,
        },
        isMuted: { default: false },
        soundExtension: { default: 'wav' },
    },
}
