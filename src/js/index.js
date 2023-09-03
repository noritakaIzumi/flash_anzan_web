import '../scss/styles.scss'
import * as bootstrap from 'bootstrap'
import {Howl} from 'howler';
import {SimpleKeyboard} from "simple-keyboard";
import {FlashAnswer, generateNumbers} from "./flash_numbers";
import {
    answerNumber,
    answerNumberDisplay,
    audioAttr,
    audioObj,
    audioStatus,
    audioStatusInnerHtmlMap,
    button,
    calculateArea,
    currentMode,
    difficultyMap,
    disableConfigTarget,
    element,
    headerMessage,
    inputAnswerBox,
    isMuted,
    isMutedMap,
    modals,
    modeNames,
    multiplyFigure,
    noticeArea,
    numberHistoryDisplay,
    numberHistoryDisplayDelimiter,
    numberHistoryString,
    numberHistoryStringifyDelimiter,
    param,
    questionNumberArea,
    savedParamsKeyName
} from "./globals";
import {getTime} from "./time";

/* button events */

function doLoadParams() {
    const modal = document.getElementById('loadParamsCompletedModal');
    const modalMessage = modal.querySelector('.modal-body > p');

    const loadedParams = localStorage.getItem(savedParamsKeyName);
    if (!loadedParams) {
        modalMessage.innerHTML = '設定がありません';
        return;
    }
    modalMessage.innerHTML = '設定を読み込みました';

    const parsedParams = JSON.parse(loadedParams);
    Object.keys(parsedParams).map(
        (mode) => {
            Object.keys(parsedParams[mode]).map(
                (paramName) => {
                    element[mode][paramName].value = parsedParams[mode][paramName];
                });
        }
    );

    element.common.isMuted.checked = element.common.isMuted.value === isMutedMap.on;
    toggleMute();
    loadAudioObj(element.common.soundExtension.value);
    // 難易度選択
    document.querySelector('#difficulty-' + element.common.difficulty.value).checked = true;
}

function doSaveParams() {
    const params = {};
    Object.keys(element).map(
        (mode) => {
            params[mode] = {};
            Object.keys(element[mode]).map(
                (paramName) => {
                    params[mode][paramName] = element[mode][paramName].value;
                });
        }
    );
    localStorage.setItem(savedParamsKeyName, JSON.stringify(params));
}

function doDeleteParams() {
    localStorage.clear();
}

function setSoundExtension(extension) {
    switch (extension) {
        case 'ogg':
            loadAudioObj(audioAttr.extension.ogg);
            break;
        case 'wav':
            loadAudioObj(audioAttr.extension.wav);
            break;
    }
}

function toggleFullscreenMode(full) {
    if (full === true) {
        expandCalculateArea();
        calculateArea.dataset.fullScreen = "1";
    } else if (full === false) {
        contractCalculateArea();
        calculateArea.dataset.fullScreen = "0";
    } else if (!isFullscreen()) {
        expandCalculateArea();
        calculateArea.dataset.fullScreen = "1";
    } else {
        contractCalculateArea();
        calculateArea.dataset.fullScreen = "0";
    }
}

function toggleMute() {
    if (isMuted.checked || isMuted.value === isMutedMap.on) {
        isMuted.checked = true;
        isMuted.value = isMutedMap.on;
        audioStatus.innerHTML = audioStatusInnerHtmlMap.off;
    } else {
        isMuted.checked = false;
        isMuted.value = isMutedMap.off;
        audioStatus.innerHTML = audioStatusInnerHtmlMap.on;
    }
}

// TODO: このファイルをクラス化して共通部分をまとめる
//  switch 文もまとめる

function fixValue(limit, targetValue) {
    return Math.floor(Math.min(limit.max, Math.max(limit.min, targetValue)));
}

function increaseParam(id, amount) {
    const element = document.getElementById(id);
    if (element.disabled) {
        return;
    }

    const currentValue = Number(element.value);
    const paramName = id.split("-")[1];
    switch (paramName) {
        case "digit":
            if (currentMode.innerText === modeNames.multiplication) {
                element.value = fixValue(
                    param[currentMode.innerText][paramName + id.split("-")[2]],
                    Math.floor(currentValue) + amount
                ).toString();
            } else if (currentMode.innerText === modeNames.addition) {
                element.value = fixValue(
                    param[currentMode.innerText][paramName],
                    Math.floor(currentValue) + amount
                ).toString();
            }
            break;
        case "length":
            element.value = fixValue(
                param[currentMode.innerText][paramName],
                Math.floor(currentValue) + amount
            ).toString();
            break;
        case "time":
            element.value = (
                fixValue(
                    param[currentMode.innerText][paramName],
                    Math.round(currentValue * 1000) + amount
                ) / 1000
            ).toString();
            break;
    }
}

function setUpInputBox() {
    Object.keys(element).map((mode) => {
        Object.keys(element[mode]).map((config) => {
            if (config === "isMuted") {
                element[mode][config].checked = param[mode][config].default;
                element[mode][config].value = element[mode][config].checked ? isMutedMap.on : isMutedMap.off;
                toggleMute();
            } else if (config === "difficulty" || config === "soundExtension") {
                element[mode][config].value = param[mode][config].default;
            } else if (config === "time") {
                element[mode][config].max = param[mode][config].max / 1000;
                element[mode][config].min = param[mode][config].min / 1000;
                element[mode][config].value = param[mode][config].default / 1000;
                element[mode][config].step = param[mode][config].step / 1000;
            } else {
                element[mode][config].max = param[mode][config].max;
                element[mode][config].min = param[mode][config].min;
                element[mode][config].value = param[mode][config].default;
            }
            element[mode][config].onfocus = function () {
                this.tmp = this.value;
                this.value = "";
            };
            element[mode][config].onblur = function () {
                if (this.value === "") {
                    this.value = this.tmp;
                }
            };
        });
    });
    currentMode.innerText = modeNames.addition;
    changeMode(currentMode.innerText);
}

function changeShortcut(mode) {
    ["y", "h", "u", "j", "i", "k", "o", "l", "shift+o", "shift+l", "ctrl+shift+o", "ctrl+shift+l"].map((key) => {
        shortcut.remove(key);
    });
    switch (mode) {
        case modeNames.multiplication:
            shortcut.add("y", () => increaseParam(mode + "-digit-1", 1));
            shortcut.add("h", () => increaseParam(mode + "-digit-1", -1));
            shortcut.add("u", () => increaseParam(mode + "-digit-2", 1));
            shortcut.add("j", () => increaseParam(mode + "-digit-2", -1));
            break;
        case modeNames.addition:
        default:
            shortcut.add("u", () => increaseParam(mode + "-digit", 1));
            shortcut.add("j", () => increaseParam(mode + "-digit", -1));
    }
    shortcut.add("i", () => increaseParam(mode + "-length", 1));
    shortcut.add("k", () => increaseParam(mode + "-length", -1));
    shortcut.add("o", () => increaseParam(mode + "-time", 1000));
    shortcut.add("l", () => increaseParam(mode + "-time", -1000));
    shortcut.add("shift+o", () => increaseParam(mode + "-time", 100));
    shortcut.add("shift+l", () => increaseParam(mode + "-time", -100));
    shortcut.add("ctrl+shift+o", () => increaseParam(mode + "-time", 10));
    shortcut.add("ctrl+shift+l", () => increaseParam(mode + "-time", -10));
}

function changeMode(mode) {
    changeShortcut(mode);
    currentMode.innerText = mode;
}

function expandCalculateArea() {
    calculateArea.classList.add('full-screen');
    questionNumberArea.classList.add('big-size-number');
}

function contractCalculateArea() {
    questionNumberArea.classList.remove('big-size-number');
    calculateArea.classList.remove('full-screen');
}

function getCurrentParam() {
    let requestParam = {
        digit: 0,
        length: 0,
        time: 0,
        difficulty: "",
        flashRate: 0,
        offset: 0,
    };
    switch (currentMode.innerText) {
        case modeNames.multiplication:
            requestParam.digit = [
                fixValue(
                    param[currentMode.innerText].digit1,
                    Math.floor(Number(element[currentMode.innerText].digit1.value))
                ),
                fixValue(
                    param[currentMode.innerText].digit2,
                    Math.floor(Number(element[currentMode.innerText].digit2.value))
                )
            ];
            element[currentMode.innerText].digit1.value = requestParam.digit[0];
            element[currentMode.innerText].digit2.value = requestParam.digit[1];
            break;
        case modeNames.addition:
        default:
            requestParam.digit = fixValue(
                param[currentMode.innerText].digit,
                Math.floor(Number(element[currentMode.innerText].digit.value))
            );
            element[currentMode.innerText].digit.value = requestParam.digit;
    }
    requestParam.length = fixValue(
        param[currentMode.innerText].length,
        Math.floor(Number(element[currentMode.innerText].length.value))
    );
    requestParam.time = fixValue(
        param[currentMode.innerText].time,
        Number(element[currentMode.innerText].time.value) * 1000
    );
    requestParam.difficulty = element.common.difficulty.value;
    requestParam.flashRate = fixValue(
        param.common.flashRate,
        Number(element.common.flashRate.value)
    );
    requestParam.offset = fixValue(
        param.common.offset,
        Number(element.common.offset.value)
    );

    return requestParam;
}

function muteIsOn() {
    return isMuted.checked;
}

function flash(config = {}) {
    const measuredTime = {start: 0, end: 0};

    /**
     * 数字を表示させる順番を作成する。点滅なので数字・空文字の順番に配列に入れていく。
     * @param {string[]} fmtNumbers 整形された数字の配列
     * @returns {string[]} 点滅も含めた数字の表示順の配列
     */
    function generateToggleNumberSuite(fmtNumbers) {
        let toggleNumberSuite = [];
        for (let i = 0; i < fmtNumbers.length; i++) {
            toggleNumberSuite.push(fmtNumbers[i]);
            toggleNumberSuite.push("");
        }
        return toggleNumberSuite;
    }

    /**
     * 画面の表示に合わせて鳴らす音の順番の配列を作成する。
     * @returns {*[]}
     */
    function generateSoundSuite() {
        let sounds = [];
        for (let i = 0; i < requestParam.length; ++i) {
            sounds.push(muteIsOn() ? null : audioObj.tick[i]);
            sounds.push(null);
        }
        return sounds;
    }

    /**
     * ボタンを無効化する。
     */
    function disableHtmlButtons() {
        disableConfigTarget.map((element) => element.disabled = true);
    }

    /**
     * ボタンを有効化する。
     */
    function enableHtmlButtons() {
        disableConfigTarget.map((element) => element.disabled = false);
    }

    /**
     * 答えを表示する
     * @param {string} numberStr 答えの数字
     * @param {FlashAnswer} answer
     */
    function displayAnswer(numberStr, answer) {
        if (numberStr) {
            headerMessage.innerText = "あなたの答え：" + Number(numberStr).toLocaleString();
        }

        button.repeat.disabled = true;
        if (!muteIsOn()) {
            audioObj.answer[0].play();
        }

        setTimeout(() => {
            let resultAudio;
            if (numberStr === String(answer.toNumber())) {
                resultAudio = audioObj.correct[0];
                headerMessage.innerText = `正解！（${headerMessage.innerText}）\n`;
            } else if (numberStr.length > 0) {
                resultAudio = audioObj.incorrect[0];
                headerMessage.innerText = `不正解...（${headerMessage.innerText}）\n`;
            } else {
                resultAudio = audioObj.silence[0];
                headerMessage.innerText = "答え\n";
            }
            {
                const flashElapsedTimeMs = Math.floor(measuredTime.end - measuredTime.start);
                const afterDecimalPointStr = ('00' + String(flashElapsedTimeMs % 1000)).slice(-3);
                const beforeDecimalPointStr = String(Math.floor(flashElapsedTimeMs / 1000));
                headerMessage.innerText += `実時間計測: ${beforeDecimalPointStr}.${afterDecimalPointStr} 秒（1 口目表示～最終口消画）`;
            }
            questionNumberArea.innerText = answer.toDisplay();
            if (!muteIsOn()) {
                resultAudio.play();
            }

            enableHtmlButtons();
            button.numberHistory.disabled = false;
            if (isFullscreen()) {
                if (isTouchDevice()) { // タッチデバイス
                    calculateArea.addEventListener("touchend", (event) => {
                        event.preventDefault();
                        toggleFullscreenMode(false);
                    }, {once: true});
                    noticeArea.innerText = '画面をタッチすると戻ります。';
                } else { // 非タッチデバイス
                    noticeArea.innerText = 'W キーを押すと戻ります。';
                }
            }
        }, 1200);
    }

    /**
     * 答え入力のための準備的な。
     * @param {FlashAnswer} answer
     */
    const getPrepareAnswerInputFunc = (answer) =>
        () => {
            inputAnswerBox.value = '';

            // モーダル表示時のイベント設定
            const listener = isTouchDevice()
                ? () => {
                    modals.input_answer.querySelector('.modal-footer').style.display = 'none';
                    clearInputAnswerBox();
                    document.getElementById('switchInputAnswerBoxTab-touch-tab').click();
                    document.getElementById('notice-input-answer-non-touch-device').style.display = 'none';
                }
                : () => {
                    clearInputAnswerBox();
                    document.getElementById('switchInputAnswerBoxTab-keyboard-tab').click();
                    document.getElementById('input-answer-box').focus();
                    document.getElementById('notice-input-answer-non-touch-device').style.display = 'block';
                };
            modals.input_answer.addEventListener('shown.bs.modal', listener);
            const modal = new bootstrap.Modal(modals.input_answer, {backdrop: false, keyboard: false, focus: true});
            modal.show();
            // 回答送信時のイベント設定
            if (isTouchDevice()) {
                document.querySelector('#input-answer-box-area-touch .btn-send-answer')
                    .addEventListener('click', () => {
                        displayAnswer(document.getElementById('input-answer-box-touch-actual').value, answer);
                        modal.hide();
                    }, {once: true});
            } else {
                const listener = () => {
                    return (event) => {
                        if (
                            document.activeElement.id === 'input-answer-box'
                            && String(event.key).toLowerCase() === 'enter'
                        ) {
                            displayAnswer(inputAnswerBox.value, answer);
                            modal.hide();
                            return;
                        }
                        document.addEventListener('keydown', listener(), {once: true});
                    };
                };
                document.addEventListener('keydown', listener(), {once: true});
            }
        }

    // ここからフラッシュ出題の処理
    // 設定を取得する
    let requestParam = getCurrentParam();
    element[currentMode.innerText].length.value = requestParam.length;
    element[currentMode.innerText].time.value = requestParam.time / 1000;
    element.common.flashRate.value = requestParam.flashRate;
    element.common.offset.value = requestParam.offset;

    // 出題数字を生成、または前回の出題から読み込む
    const mode = currentMode.innerText;
    let digitIsSame = false;
    let numberHistory = [];
    const arrayDelimiter = ",";
    if (mode === modeNames.multiplication) {
        const _numberHistory = numberHistoryString.innerText.split(numberHistoryStringifyDelimiter).map(number => number.split(arrayDelimiter));

        if (_numberHistory[0][1]) {
            digitIsSame = requestParam.digit[0] === _numberHistory[0][0].length && requestParam.digit[1] === _numberHistory[0][1].length;
            numberHistory = _numberHistory.map(p => p.map(n => Number(n)))
        }
    } else if (mode === modeNames.addition) {
        const _numberHistory = numberHistoryString.innerText.split(numberHistoryStringifyDelimiter);

        digitIsSame = requestParam.digit === _numberHistory[0].length;
        numberHistory = _numberHistory.map((n) => Number(n));
    } else {
        throw new RangeError('invalid mode')
    }
    const numbers = (() => {
        if (config.repeat && digitIsSame) {
            if (requestParam.length === numberHistory.length) {
                return numberHistory;
            }
            if (requestParam.length < numberHistory.length) {
                return numberHistory.slice(0, requestParam.length);
            }
            return numberHistory.concat(generateNumbers(requestParam.digit, requestParam.length - numberHistory.length, requestParam.difficulty, mode));
        }
        return generateNumbers(requestParam.digit, requestParam.length, requestParam.difficulty, mode);
    })();

    /**
     * 表示用に整形した数字の配列
     * @type {string[]}
     */
    const localeStringNumbers = (() => {
        switch (currentMode.innerText) {
            case modeNames.multiplication:
                return numbers.map((p) => p[0].toLocaleString() + multiplyFigure + p[1].toLocaleString());
            case modeNames.addition:
                return numbers.map((n) => n.toLocaleString());
            default:
                throw new RangeError('invalid mode')
        }
    })();

    const getFlashSuite = () => {
        const result = Array.from({length: requestParam.length * 2}, () => {
            return {
                toggleNumberFunction: () => {
                },
                playTickFunction: () => {
                },
                _toggleTiming: 0,
            };
        })

        const toggleNumberSuite = generateToggleNumberSuite(localeStringNumbers);
        for (const [i, toggleNumber] of toggleNumberSuite.entries()) {
            if (i === 0) {
                result[i].toggleNumberFunction = () => {
                    measuredTime.start = getTime();
                    questionNumberArea.innerText = toggleNumber;
                }
            } else if (i === toggleNumberSuite.length - 1) {
                result[i].toggleNumberFunction = () => {
                    questionNumberArea.innerText = toggleNumber;
                    measuredTime.end = getTime();
                }
            } else {
                result[i].toggleNumberFunction = () => {
                    questionNumberArea.innerText = toggleNumber;
                };
            }
        }

        const soundSuite = generateSoundSuite();
        for (const [i, sound] of soundSuite.entries()) {
            result[i].playTickFunction = sound === null
                ? () => {
                }
                : () => {
                    sound.play();
                };
        }

        for (let i = 0; i < result.length; i++) {
            result[i]._toggleTiming =
                requestParam.time
                * (Math.floor(i / 2) * 100 + requestParam.flashRate * (i % 2))
                / ((requestParam.length - 1) * 100 + requestParam.flashRate)
            ;
        }

        return result;
    };

    const playBeepFunctions = audioObj.beep.map(
        a => muteIsOn()
            ? () => {
            }
            : () => {
                a.play();
            }
    );

    // 答えと出題数字履歴を作成する
    headerMessage.innerText = "";
    questionNumberArea.innerText = "";
    button.numberHistory.disabled = true;
    const flashAnswer = (() => {
        switch (currentMode.innerText) {
            case modeNames.multiplication:
                return new FlashAnswer(numbers.reduce((a, b) => (a[1] ? a[0] * a[1] : a) + b[0] * b[1]));
            case modeNames.addition:
                return new FlashAnswer(numbers.reduce((a, b) => a + b));
            default:
                throw new RangeError('invalid mode')
        }
    })();
    answerNumber.innerText = flashAnswer.toNumber();
    numberHistoryDisplay.innerHTML = localeStringNumbers.join(numberHistoryDisplayDelimiter);
    numberHistoryString.innerText = numbers.join(numberHistoryStringifyDelimiter);
    answerNumberDisplay.innerText = flashAnswer.toDisplay();

    const start = getTime();

    function setFlashTimeOut(fn, delay) {
        const handle = {};

        function loop() {
            const current = getTime();
            const delta = current - start;
            if (delta >= delay) {
                fn.call();
            } else {
                handle.value = requestAnimationFrame(loop);
            }
        }

        handle.value = requestAnimationFrame(loop);
        return handle;
    }

    // Register flash events
    disableHtmlButtons();
    toggleFullscreenMode(true);
    noticeArea.innerText = '';
    warmUpDisplayArea(0);
    const beforeBeepTime = 500;
    const beepInterval = 875;
    const flashStartTiming = beforeBeepTime + beepInterval * 2;
    const flashSuite = getFlashSuite();
    const prepareAnswerInputFunc = getPrepareAnswerInputFunc(flashAnswer);
    setTimeout(() => {
        audioObj.silence[0].play();
    }, 0);
    setFlashTimeOut(playBeepFunctions[0], beforeBeepTime - requestParam.offset);
    setFlashTimeOut(playBeepFunctions[1], beforeBeepTime + beepInterval - requestParam.offset);
    for (let i = 0; i < flashSuite.length; i++) {
        setFlashTimeOut(flashSuite[i].playTickFunction, flashStartTiming + flashSuite[i]._toggleTiming - requestParam.offset);
        setFlashTimeOut(flashSuite[i].toggleNumberFunction, flashStartTiming + flashSuite[i]._toggleTiming);
    }
    setFlashTimeOut(prepareAnswerInputFunc, flashStartTiming + requestParam.time + 300);
}

function repeatFlash() {
    flash({repeat: true});
}

function isTouchDevice() {
    return window.ontouchstart === null;
}

function loadAudioObj(extension) {
    let timeoutMs = 100;
    let audioPath = '';
    Object.keys(audioObj).forEach((name) => {
        audioPath = `${audioAttr.directory}/${name}.${extension}`;
        for (let i = 0; i < audioObj[name].length; i++) {
            audioObj[name][i] = new Howl({src: [audioPath]});
            setTimeout(() => {
                audioObj[name][i].load();
            }, timeoutMs);
            timeoutMs += 50;
        }
    });
}

function isFullscreen() {
    return calculateArea.dataset.fullScreen === '1';
}

/**
 * 難易度切り替え
 * @param {string} value
 */
function switchDifficulty(value) {
    document.querySelector('#difficulty-' + value).checked = true;
    element.common.difficulty.value = difficultyMap[value];
}

function registerShortcuts() {
    shortcut.add("ctrl+o", () => button.loadParams.click());
    shortcut.add("ctrl+s", () => button.saveParams.click());
    shortcut.add("ctrl+r", () => button.deleteParams.click());
    shortcut.add("s", () => button.start.click());
    shortcut.add("r", () => button.repeat.click());
    shortcut.add("z", () => button.addition.click());
    shortcut.add("x", () => button.subtraction.click());
    shortcut.add("c", () => button.multiplication.click());
    shortcut.add("d", () => switchDifficulty('easy'));
    shortcut.add("f", () => switchDifficulty('normal'));
    shortcut.add("g", () => switchDifficulty('hard'));
    shortcut.add("n", () => button.numberHistory.click());
    shortcut.add("w", () => toggleFullscreenMode());
    shortcut.add("q", () => button.help.click());
    shortcut.add('ctrl+,', () => button.openCommonMoreConfig.click());
}

function configureModalFocusing() {
    Object.keys(modals.params).forEach((op) => {
        const confirm = modals.params[op]['confirm'];
        const b = confirm.querySelector('.modal-footer > button:last-child');
        confirm.addEventListener('shown.bs.modal', () => {
            b.focus();
        });

        const completed = modals.params[op]['complete'];
        completed.addEventListener('shown.bs.modal', () => {
            setTimeout(() => {
                completed.querySelector('.modal-header > button').click();
            }, 1000);
        });
    });
}

/**
 * 表示エリアのウォーミングアップ。
 * フォントの読み込みに時間がかかるため，ウォーミングアップで 1 回見えない文字を光らせておく。
 * @param {number} timeoutMs
 * @returns {number}
 */
function warmUpDisplayArea(timeoutMs) {
    const currentNumberColor = questionNumberArea.style.color;
    const prepareGameFunctions = [
        () => questionNumberArea.style.color = "black",
        () => questionNumberArea.innerText = "0",
        () => questionNumberArea.innerText = "",
        () => questionNumberArea.style.color = currentNumberColor,
    ];
    prepareGameFunctions.map((func) => {
        setTimeout(func, timeoutMs);
        timeoutMs += 50;
    });
    return timeoutMs;
}

function clearInputAnswerBox() {
    document.getElementById('input-answer-box').value = '';
    document.getElementById('input-answer-box-touch-display').value = '';
    document.getElementById('input-answer-box-touch-actual').value = '';
}

(() => {
    // バージョン番号
    const version = 'v0.18.1';
    const warmupDelay = 1000;

    const setup = () => {
        const audioContext = new AudioContext();

        // ページ読み込み時処理
        (() => {
            loadAudioObj(param.common.soundExtension.default);
            button.start.addEventListener('click', () => {
                audioContext.resume().then(() => {
                });
            });

            (() => {
                let timeoutMs = warmUpDisplayArea(warmupDelay);
                const prepareGameFunctions = [
                    setUpInputBox,
                    configureModalFocusing,
                    () => {
                        button.help.disabled = false;
                        button.openCommonMoreConfig.disabled = false;
                        button.loadParams.disabled = false;
                        button.saveParams.disabled = false;
                        button.deleteParams.disabled = false;
                        button.start.disabled = false;
                    },
                    registerShortcuts,
                ];
                prepareGameFunctions.map((func) => {
                    setTimeout(func, timeoutMs);
                    timeoutMs += 50;
                });

                if (isTouchDevice()) {
                    document.getElementById('help-button').style.display = 'none';
                }
            })();
        })();

        // タッチデバイスの回答入力
        (() => {
            let inputs = [];

            function onKeyPress(button) {
                if (!button) {
                    return;
                }
                const matched = button.match(/\d/g)[0];
                if (!matched) {
                    return;
                }
                inputs.push(matched);
                let value = '';
                {
                    const reversedInputs = [...inputs].reverse();
                    let n = 0;
                    for (let i = 0; i < inputs.length; i++) {
                        if (n === 3) {
                            value = `,${value}`;
                            n = 0;
                        }
                        value = reversedInputs[i] + value;
                        n++;
                    }
                }
                value = value.replace(/^[0,]+/g, '');
                document.getElementById('input-answer-box-touch-display').value = value === '' ? '0' : value;
                document.getElementById('input-answer-box-touch-actual').value = value === '' ? '0' : value.replace(',', '');
            }

            const clearInput = () => {
                clearInputAnswerBox();
                inputs = [];
            };
            Array.from(document.getElementsByClassName('btn-clear-input-answer-box')).forEach(element => {
                element.addEventListener('click', clearInput);
            });
            modals.input_answer.addEventListener('show.bs.modal', clearInput);

            new SimpleKeyboard({
                onKeyPress: button => onKeyPress(button),
                layout: {
                    default: [
                        "{numpad7} {numpad8} {numpad9}",
                        "{numpad4} {numpad5} {numpad6}",
                        "{numpad1} {numpad2} {numpad3}",
                        " 0 ",
                    ],
                },
            });
        })();

        // 回答入力タブ切り替え動作イベントを登録
        (() => {
            const triggerTabs = [].slice.call(document.querySelectorAll('#switchInputAnswerBoxTab button'));
            triggerTabs.forEach(element => {
                const tabTrigger = new bootstrap.Tab(element);
                element.addEventListener('click', (event) => {
                    event.preventDefault();
                    tabTrigger.show();
                });
            });
        })();

        // バージョン番号の表示
        (() => {
            document.getElementById('version-number').innerText = version;
        })();

        // set onclick events in index.html
        (() => {
            // フラッシュ操作
            button.start.addEventListener('click', flash)
            button.repeat.addEventListener('click', repeatFlash)

            // モード切り替え
            button.addition.addEventListener('click', () => changeMode(modeNames.addition))
            // button.subtraction.addEventListener('click', () => changeMode(modeNames.subtraction))
            button.multiplication.addEventListener('click', () => changeMode(modeNames.multiplication))

            // 難易度切り替え
            button.difficulty.easy.addEventListener('click', () => {
                element.common.difficulty.value = 'easy';
            })
            button.difficulty.normal.addEventListener('click', () => {
                element.common.difficulty.value = 'normal';
            })
            button.difficulty.hard.addEventListener('click', () => {
                element.common.difficulty.value = 'hard';
            })

            // サウンド
            element.common.isMuted.addEventListener('click', toggleMute)
            element.common.soundExtension.addEventListener('change', event => setSoundExtension(event.target.value))

            // 出題設定読み込み
            button.doLoadParams.addEventListener('click', doLoadParams)
            button.doSaveParams.addEventListener('click', doSaveParams)
            button.doDeleteParams.addEventListener('click', doDeleteParams)
        })();
    };

    (() => {
        document.querySelector('#welcomeModal .modal-footer > button').addEventListener('click', setup);
        const welcomeModal = new bootstrap.Modal(modals.welcome, {backdrop: 'static', keyboard: false, focus: true});
        welcomeModal.show();
    })();
})();
