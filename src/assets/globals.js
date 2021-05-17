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
            default: 0,
        },
    },
};

headerMessage = document.getElementById("header-message");
questionNumberArea = document.getElementById("question-number-area");
calculateArea = document.getElementById('calculate-area');
inputAnswerBox = document.getElementById('input-answer-box');
questionInfoLabel = document.getElementById('question-info-label');

button = {
    loadParams: document.getElementById("load-params-button"),
    saveParams: document.getElementById("save-params-button"),
    deleteParams: document.getElementById("delete-params-button"),
    start: document.getElementById("start-button"),
    repeat: document.getElementById("repeat-button"),
    numberHistory: document.getElementById("number-history-button"),
    addition: document.getElementById("pills-addition-tab"),
    subtraction: document.getElementById("pills-subtraction-tab"),
    multiplication: document.getElementById("pills-multiplication-tab"),
    openInputAnswer: document.getElementById('openInputAnswerModal'),
    closeInputAnswer: document.getElementById('closeInputAnswerModal'),
    help: document.getElementById('help-button'),
    openCommonMoreConfig: document.getElementById('open-common-more-config-button'),
    mute: document.getElementById('is-muted'),
};

answerNumber = document.getElementById("answer-number");

// RMS -9.0 dB 付近で調整し，あとは聞いた感じで微調整
audioAttr = {
    directory: "./sound",
    extension: {
        ogg: 'ogg',
        wav: 'wav',
    },
};
defaultAudioExtension = audioAttr.extension.wav;
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
muteStatus = document.getElementById('mute-status');

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
numberHistoryDisplayDelimiter = "<br>";
numberHistoryString = document.getElementById("number-history-stringify");
numberHistoryStringifyDelimiter = "|";
answerNumberDisplay = document.getElementById('answer-number-display');

savedParamsKeyName = "flash_anzan_params";

modals = {
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

generateNumbersRetryLimit = 100000;
difficultyInput = document.getElementById('difficulty');
difficultyMap = {
    easy: 'easy',
    normal: 'normal',
    hard: 'hard',
};
difficultyButtons = {
    easy: document.getElementById('difficulty-easy'),
    normal: document.getElementById('difficulty-normal'),
    hard: document.getElementById('difficulty-hard'),
};
