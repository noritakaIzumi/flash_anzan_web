import {
    FlashDifficultyParam,
    FlashIsMutedParam,
    FlashNumberParam,
    FlashNumberWithDifficultySupportParam,
    FlashSoundExtensionParam,
    FlashTimeParam
} from "../flash/flashParams.js"
import { button, getHtmlElement } from "./htmlElement.js"

import { flashParamSchema } from "../../config/flashParamSchema.js"

export interface FlashParamElements {
    addition: {
        digit: FlashNumberWithDifficultySupportParam
        length: FlashNumberWithDifficultySupportParam
        time: FlashTimeParam
    }
    multiplication: {
        digit1: FlashNumberWithDifficultySupportParam
        digit2: FlashNumberWithDifficultySupportParam
        length: FlashNumberWithDifficultySupportParam
        time: FlashTimeParam
    }
    common: {
        difficulty: FlashDifficultyParam
        flashRate: FlashNumberParam
        offset: FlashNumberParam
        isMuted: FlashIsMutedParam
        soundExtension: FlashSoundExtensionParam
    }
}

export const flashParamElements: FlashParamElements = {
    addition: {
        digit: new FlashNumberWithDifficultySupportParam({
            htmlElement: getHtmlElement("select", "addition-digit"),
            schema: flashParamSchema.addition.digit,
        }),
        length: new FlashNumberWithDifficultySupportParam({
            htmlElement: getHtmlElement("select", "addition-length"),
            schema: flashParamSchema.addition.length,
        }),
        time: new FlashTimeParam({
            htmlElement: getHtmlElement("input", "addition-time"),
            digitElements: {
                int: getHtmlElement("select", "addition-time-int"),
                dec1: getHtmlElement("select", "addition-time-dec1"),
                dec2: getHtmlElement("select", "addition-time-dec2"),
            },
            schema: flashParamSchema.addition.time,
        }),
    },
    multiplication: {
        digit1: new FlashNumberWithDifficultySupportParam({
            htmlElement: getHtmlElement("select", "multiplication-digit-1"),
            schema: flashParamSchema.multiplication.digit1,
        }),
        digit2: new FlashNumberWithDifficultySupportParam({
            htmlElement: getHtmlElement("select", "multiplication-digit-2"),
            schema: flashParamSchema.multiplication.digit2,
        }),
        length: new FlashNumberWithDifficultySupportParam({
            htmlElement: getHtmlElement("select", "multiplication-length"),
            schema: flashParamSchema.multiplication.length,
        }),
        time: new FlashTimeParam({
            htmlElement: getHtmlElement("input", "multiplication-time"),
            digitElements: {
                int: getHtmlElement("select", "multiplication-time-int"),
                dec1: getHtmlElement("select", "multiplication-time-dec1"),
                dec2: getHtmlElement("select", "multiplication-time-dec2"),
            },
            schema: flashParamSchema.multiplication.time,
        }),
    },
    common: {
        difficulty: new FlashDifficultyParam({
            htmlElement: getHtmlElement("select", "difficulty"),
            schema: flashParamSchema.common.difficulty,
        }),
        flashRate: new FlashNumberParam({
            htmlElement: getHtmlElement("input", "common-flashRate"),
            schema: flashParamSchema.common.flashRate,
        }),
        offset: new FlashNumberParam({
            htmlElement: getHtmlElement("input", "common-offset"),
            schema: flashParamSchema.common.offset,
        }),
        isMuted: new FlashIsMutedParam({
            htmlElement: getHtmlElement("input", "is-muted"),
            schema: flashParamSchema.common.isMuted,
            options: {
                buttonElement: button.isMuted,
                audioStatusElement: getHtmlElement("label", "audio-status"),
            },
        }),
        soundExtension: new FlashSoundExtensionParam({
            htmlElement: getHtmlElement("select", "sound-extension"),
            schema: flashParamSchema.common.soundExtension,
        }),
    },
}

export const flashParamElementCategoryName: { [key in keyof FlashParamElements]: Lowercase<key> } = {
    addition: "addition",
    multiplication: "multiplication",
    common: "common",
}
