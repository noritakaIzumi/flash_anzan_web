/* Global variables */

import {getHtmlElement} from "./htmlElement";
import {FlashNumberParam, FlashTimeParam} from "./flashParams";

export const flashModes = ['addition', 'multiplication'] as const;
export type FlashMode = typeof flashModes[number];

export const modeNames = {
    addition: "addition",
    multiplication: "multiplication",
};

export const difficultyMap = {
    easy: 'easy',
    normal: 'normal',
    hard: 'hard',
};

export const isMutedMap = {
    on: 'on',
    off: 'off',
};

export const audioAttr = {
    directory: "./sounds",
    extension: {
        ogg: 'ogg',
        wav: 'wav',
    },
};

export const flashParamElements = {
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
            schema: {min: 2, max: 30, default: 3},
        }),
        time: new FlashTimeParam({
            htmlElement: getHtmlElement("input", "multiplication-time"),
            schema: {min: 1000, max: 30000, default: 5000},
        }),
    },
    common: {
        difficulty: getHtmlElement("select", "difficulty"),
        flashRate: getHtmlElement("input", "common-flashRate"),
        offset: getHtmlElement("input", "common-offset"),
        isMuted: getHtmlElement("input", "is-muted"),
        soundExtension: getHtmlElement("select", "sound-extension"),
    },
};
export const flashParamConfig = {
    addition: {
        digit: {
            max: 14,
            min: 1,
            default: 1,
        },
        length: {
            max: 30,
            min: 2,
            default: 3,
        },
        time: {
            max: 30000,
            min: 1000,
            default: 5000,
        },
    },
    multiplication: {
        digit1: {
            max: 7,
            min: 1,
            default: 1,
        },
        digit2: {
            max: 7,
            min: 1,
            default: 1,
        },
        length: {
            max: 30,
            min: 2,
            default: 2,
        },
        time: {
            max: 30000,
            min: 1000,
            default: 5000,
        },
    },
    common: {
        difficulty: {
            default: difficultyMap.easy,
        },
        flashRate: {
            max: 99,
            min: 1,
            default: 55,
        },
        offset: {
            max: 500,
            min: -500,
            default: 0,
        },
        isMuted: {
            default: false,
        },
        soundExtension: {
            default: audioAttr.extension.wav,
        },
    },
};

export const headerMessage = getHtmlElement("div", "header-message");
export const questionNumberArea = getHtmlElement("div", "question-number-area");
export const calculateArea = getHtmlElement("div", "calculate-area");
export const inputAnswerBox = getHtmlElement("input", "input-answer-box");
export const inputAnswerBoxTouchDisplay = getHtmlElement("input", "input-answer-box-touch-display");
export const inputAnswerBoxTouchActual = getHtmlElement("input", "input-answer-box-touch-actual");
export const noticeArea = getHtmlElement("p", "notice-area");
export const versionNumber = getHtmlElement("span", "version-number")

export const button = {
    loadParams: getHtmlElement("button", "load-params-button"),
    doLoadParams: getHtmlElement("button", "do-load-params"),
    saveParams: getHtmlElement("button", "save-params-button"),
    doSaveParams: getHtmlElement("button", "do-save-params"),
    deleteParams: getHtmlElement("button", "delete-params-button"),
    doDeleteParams: getHtmlElement("button", "do-delete-params"),
    start: getHtmlElement("button", "start-button"),
    repeat: getHtmlElement("button", "repeat-button"),
    numberHistory: getHtmlElement("button", "number-history-button"),
    addition: getHtmlElement("a", "pills-addition-tab"),
    subtraction: getHtmlElement("a", "pills-subtraction-tab"),
    multiplication: getHtmlElement("a", "pills-multiplication-tab"),
    closeInputAnswer: getHtmlElement("button", 'closeInputAnswerModal'),
    help: getHtmlElement("button", 'help-button'),
    openCommonMoreConfig: getHtmlElement("button", 'open-common-more-config-button'),
    difficulty: {
        easy: getHtmlElement("input", 'difficulty-easy'),
        normal: getHtmlElement("input", 'difficulty-normal'),
        hard: getHtmlElement("input", 'difficulty-hard'),
    },
    isMuted: getHtmlElement("input", "is-muted-button"),
};

// RMS -9.0 dB 付近で調整し，あとは聞いた感じで微調整
export const audioObj = {
    beep: new Array(2),
    tick: new Array(30),
    answer: new Array(1),
    correct: new Array(1),
    incorrect: new Array(1),
    silence: new Array(1),
};

export const audioStatus = getHtmlElement("label", "audio-status");

export const disableConfigTarget = [
    button.start,
    button.repeat,
    button.loadParams,
    button.saveParams,
    button.deleteParams,
];

export const multiplyFigure = "*";

export const switchInputAnswerBoxTab = {
    touchTab: getHtmlElement("button", "switchInputAnswerBoxTab-touch-tab"),
    keyboardTab: getHtmlElement("button", "switchInputAnswerBoxTab-keyboard-tab"),
}
export const noticeInputAnswerNonTouchDevice = getHtmlElement("span", "notice-input-answer-non-touch-device")
export const numberHistoryDisplay = getHtmlElement("td", "number-history-display");
export const numberHistoryDisplayDelimiter = "<br>";
export const answerNumberDisplay = getHtmlElement("td", "answer-number-display");

export const savedParamsKeyName = "flash_anzan_params";

export const modals = {
    welcome: getHtmlElement("div", "welcomeModal"),
    params: {
        load: {
            confirm: getHtmlElement("div", "loadParamsConfirmModal"),
            complete: getHtmlElement("div", "loadParamsCompletedModal"),
        },
        save: {
            confirm: getHtmlElement("div", "saveParamsConfirmModal"),
            complete: getHtmlElement("div", "saveParamsCompletedModal"),
        },
        delete: {
            confirm: getHtmlElement("div", "deleteParamsConfirmModal"),
            complete: getHtmlElement("div", "deleteParamsCompletedModal"),
        },
    },
    input_answer: getHtmlElement("div", "inputAnswerModal"),
};

export const generateNumbersRetryLimit = 100000;
