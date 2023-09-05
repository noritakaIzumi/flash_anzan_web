/* Global variables */

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

export const audioStatusInnerHtmlMap = {
    on: '<i class="bi bi-volume-up"></i><span class="ps-2">オン</span>',
    off: '<i class="bi bi-volume-mute"></i><span class="ps-2">オフ</span>',
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

export const element = {
    addition: {
        digit: document.getElementById("addition-digit"),
        length: document.getElementById("addition-length"),
        time: document.getElementById("addition-time"),
    },
    multiplication: {
        digit1: document.getElementById("multiplication-digit-1"),
        digit2: document.getElementById("multiplication-digit-2"),
        length: document.getElementById("multiplication-length"),
        time: document.getElementById("multiplication-time"),
    },
    common: {
        difficulty: document.getElementById('difficulty'),
        flashRate: document.getElementById("common-flashRate"),
        offset: document.getElementById("common-offset"),
        isMuted: document.getElementById("is-muted"),
        soundExtension: document.getElementById("sound-extension"),
    },
};

export const param = {
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

export const headerMessage = document.getElementById("header-message");
export const questionNumberArea = document.getElementById("question-number-area");
export const calculateArea = document.getElementById('calculate-area');
export const inputAnswerBox = document.getElementById('input-answer-box');
export const noticeArea = document.getElementById('notice-area');

export const button = {
    loadParams: document.getElementById("load-params-button"),
    doLoadParams: document.getElementById("do-load-params"),
    saveParams: document.getElementById("save-params-button"),
    doSaveParams: document.getElementById("do-save-params"),
    deleteParams: document.getElementById("delete-params-button"),
    doDeleteParams: document.getElementById("do-delete-params"),
    start: document.getElementById("start-button"),
    repeat: document.getElementById("repeat-button"),
    numberHistory: document.getElementById("number-history-button"),
    addition: document.getElementById("pills-addition-tab"),
    subtraction: document.getElementById("pills-subtraction-tab"),
    multiplication: document.getElementById("pills-multiplication-tab"),
    // openInputAnswer: document.getElementById('openInputAnswerModal'),
    closeInputAnswer: document.getElementById('closeInputAnswerModal'),
    help: document.getElementById('help-button'),
    openCommonMoreConfig: document.getElementById('open-common-more-config-button'),
    difficulty: {
        easy: document.getElementById('difficulty-easy'),
        normal: document.getElementById('difficulty-normal'),
        hard: document.getElementById('difficulty-hard'),
    }
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

export const isMuted = document.getElementById("is-muted");
export const audioStatus = document.getElementById('audio-status');

export const disableConfigTarget = [
    button.start,
    button.repeat,
    button.loadParams,
    button.saveParams,
    button.deleteParams
];

export const multiplyFigure = "*";

export const numberHistoryDisplay = document.getElementById("number-history-display");
export const numberHistoryDisplayDelimiter = "<br>";
export const answerNumberDisplay = document.getElementById('answer-number-display');

export const savedParamsKeyName = "flash_anzan_params";

export const modals = {
    welcome: document.getElementById('welcomeModal'),
    'params': {
        'load': {
            'confirm': document.getElementById('loadParamsConfirmModal'),
            'complete': document.getElementById('loadParamsCompletedModal'),
        },
        'save': {
            'confirm': document.getElementById('saveParamsConfirmModal'),
            'complete': document.getElementById('saveParamsCompletedModal'),
        },
        'delete': {
            'confirm': document.getElementById('deleteParamsConfirmModal'),
            'complete': document.getElementById('deleteParamsCompletedModal'),
        },
    },
    'input_answer': document.getElementById('inputAnswerModal'),
};

export const generateNumbersRetryLimit = 100000;
