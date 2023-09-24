import { type FlashParamSchema } from "../js/flash/flashParamSchema.js"

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
        difficulty: { default: "easy" },
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
        soundExtension: { default: "wav" },
    },
}
