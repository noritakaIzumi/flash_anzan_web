import {
    FlashDifficultyParam,
    FlashIsMutedParam,
    FlashNumberParam,
    FlashSoundExtensionParam,
    FlashTimeParam
} from "../flash/flashParams.js";
import {button, getHtmlElement} from "./htmlElement.js";

export type FlashParamElements = {
    addition: {
        digit: FlashNumberParam
        length: FlashNumberParam
        time: FlashTimeParam
    }
    multiplication: {
        digit1: FlashNumberParam
        digit2: FlashNumberParam
        length: FlashNumberParam
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
        digit: new FlashNumberParam({
            htmlElement: getHtmlElement("input", "addition-digit"),
            schema: {min: 1, max: 14, default: 1},
        }),
        length: new FlashNumberParam({
            htmlElement: getHtmlElement("input", "addition-length"),
            schema: {min: 2, max: 30, default: 3},
        }),
        time: new FlashTimeParam({
            htmlElement: getHtmlElement("input", "addition-time"),
            schema: {min: 1000, max: 30000, default: 5000},
        }),
    },
    multiplication: {
        digit1: new FlashNumberParam({
            htmlElement: getHtmlElement("input", "multiplication-digit-1"),
            schema: {min: 1, max: 7, default: 1},
        }),
        digit2: new FlashNumberParam({
            htmlElement: getHtmlElement("input", "multiplication-digit-2"),
            schema: {min: 1, max: 7, default: 1},
        }),
        length: new FlashNumberParam({
            htmlElement: getHtmlElement("input", "multiplication-length"),
            schema: {min: 2, max: 30, default: 2},
        }),
        time: new FlashTimeParam({
            htmlElement: getHtmlElement("input", "multiplication-time"),
            schema: {min: 1000, max: 30000, default: 5000},
        }),
    },
    common: {
        difficulty: new FlashDifficultyParam({
            htmlElement: getHtmlElement("select", "difficulty"),
            schema: {default: 'easy'},
        }),
        flashRate: new FlashNumberParam({
            htmlElement: getHtmlElement("input", "common-flashRate"),
            schema: {min: 1, max: 99, default: 55},
        }),
        offset: new FlashNumberParam({
            htmlElement: getHtmlElement("input", "common-offset"),
            schema: {min: -500, max: 500, default: 0},
        }),
        isMuted: new FlashIsMutedParam({
            htmlElement: getHtmlElement("input", "is-muted"),
            schema: {default: false},
            options: {
                buttonElement: button.isMuted,
                audioStatusElement: getHtmlElement("label", "audio-status"),
            },
        }),
        soundExtension: new FlashSoundExtensionParam({
            htmlElement: getHtmlElement("select", "sound-extension"),
            schema: {default: 'wav'},
        }),
    },
};

export const flashParamElementCategoryName: { [key in keyof FlashParamElements]: Lowercase<key> } = {
    addition: "addition",
    multiplication: "multiplication",
    common: "common",
}
