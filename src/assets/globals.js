/* Global variables */

modeNames = {
    addition: "addition",
    multiplication: "multiplication",
};
param = {
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
        flashRate: {
            max: 99,
            min: 1,
            default: 55,
        },
        offset: {
            max: 500,
            min: -500,
            default: 10,
        },
    },
};

headerMessage = document.getElementById("header-message");
questionNumberArea = document.getElementById("question-number-area");
calculateArea = document.getElementById('calculate-area');
inputAnswerArea = document.getElementById('input-answer-area');
inputAnswerBox = document.getElementById('input-answer-box');
questionInfoLabel = document.getElementById('question-info-label')

button = {
    loadParams: document.getElementById("load-params-button"),
    saveParams: document.getElementById("save-params-button"),
    deleteParams: document.getElementById("delete-params-button"),
    start: document.getElementById("start-button"),
    repeat: document.getElementById("repeat-button"),
    numberHistory: document.getElementById("number-history-button"),
    addition: document.getElementById("addition-button"),
    subtraction: document.getElementById("subtraction-button"),
    multiplication: document.getElementById("multiplication-button"),
};

resultSaved = document.getElementById("result-saved");
previousMode = document.getElementById("previous-mode");
answerNumber = document.getElementById("answer-number");
numberHistoryArea = document.getElementById("number-history-area");

// RMS -9.0 dB 付近で調整し，あとは聞いた感じで微調整
audioAttr = {
    directory: "./sound",
    extension: {
        ogg: 'ogg',
        wav: 'wav',
    },
};
audioObj = {
    beep: new Array(2),
    tick: new Array(30),
    answer: new Array(1),
    correct: new Array(1),
    incorrect: new Array(1),
    silence: new Array(1),
};
audioContext = new AudioContext();

currentMode = document.getElementById("current-mode");
isMuted = document.getElementById("is-muted");

element = {
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
        flashRate: document.getElementById("common-flashRate"),
        offset: document.getElementById("common-offset"),
    },
};

disableConfigTarget = [
    button.start,
    button.repeat,
    button.loadParams,
    button.saveParams,
    button.deleteParams
];

multiplyFigure = "*";

numberHistoryDisplay = document.getElementById("number-history-display");
numberHistoryDisplayDelimiter = " → ";
numberHistoryString = document.getElementById("number-history-stringify");
numberHistoryStringifyDelimiter = "|";

savedParamsKeyName = "flash_anzan_params";
