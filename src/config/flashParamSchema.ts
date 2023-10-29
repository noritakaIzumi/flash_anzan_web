import { type FlashParamSchema } from '../js/flash/flashParamSchema.js'

function getDefaultOffset(): number {
    const offset = import.meta.env.VITE_APP_DEFAULT_OFFSET
    if (offset === undefined) {
        return 0
    }
    return Number(offset)
}

export const flashParamSchema: FlashParamSchema = {
    addition: {
        digit: {
            min: 1,
            max: 14,
            default: 1,
            difficultySupportMax: 8,
        },
        length: {
            min: 2,
            max: 100,
            default: 3,
            difficultySupportMax: 15,
        },
        time: {
            min: 1_000,
            max: 20_000,
            default: 3_000,
        },
    },
    multiplication: {
        digit1: {
            min: 1,
            max: 7,
            default: 1,
            difficultySupportMax: 4,
        },
        digit2: {
            min: 1,
            max: 7,
            default: 1,
            difficultySupportMax: 4,
        },
        length: {
            min: 2,
            max: 30,
            default: 2,
            difficultySupportMax: 15,
        },
        time: {
            min: 1_000,
            max: 10_000,
            default: 3_000,
        },
    },
    common: {
        difficulty: { default: 'easy' },
        flashRate: {
            min: 1,
            max: 99,
            default: 50,
        },
        offset: {
            min: -500,
            max: 500,
            default: getDefaultOffset(),
        },
        isMuted: { default: false },
        soundExtension: { default: 'wav' },
        fixNumberInterval: { default: false },
        hideAnswer: { default: true },
    },
}
