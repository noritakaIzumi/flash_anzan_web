import '../scss/styles.scss'
import * as bootstrap from 'bootstrap'
import {SimpleKeyboard} from "simple-keyboard";
import {FlashAnswer} from "./flash_numbers.js";
import {getTime} from "./time.js";
import {CurrentFlashMode} from "./currentFlashMode.js";
import {disableHtmlButtons, enableHtmlButtons, isFullscreen, isTouchDevice, setFullscreenMode} from "./screen.js";
import {audioObj, isMuted} from "./sound.js";
import {doDeleteParams, doLoadParams, doSaveParams} from "./flashParams.js";
import {changeMode} from "./flash_param_set.js";
import {registerShortcuts} from "./shortcut/shortcut.js";
import {FlashOption, FlashQuestionCreator} from "./flash/flashQuestion.js";
import {flashParamElements} from "./dom/flashParamElements.js";
import {
    answerNumberDisplay,
    button,
    calculateArea,
    headerMessage,
    inputAnswerBox,
    inputAnswerBoxTouchActual,
    inputAnswerBoxTouchDisplay,
    modals,
    noticeArea,
    noticeInputAnswerNonTouchDevice,
    numberHistoryDisplay,
    questionNumberArea,
    switchInputAnswerBoxTab,
    versionNumber
} from "./dom/htmlElement.js";

function flash(option: FlashOption = {}) {
    const measuredTime = {start: 0, end: 0};

    /**
     * 答え入力のための準備的な。
     * @param {FlashAnswer} answer
     */
    const getPrepareAnswerInputFunc = (answer: FlashAnswer) => {
        /**
         * 答えを表示する
         * @param {string} numberStr 答えの数字
         * @param {FlashAnswer} answer
         */
        function displayAnswer(numberStr: string, answer: FlashAnswer) {
            if (numberStr) {
                headerMessage.innerText = "あなたの答え：" + Number(numberStr).toLocaleString();
            }

            button.repeat.disabled = true;
            if (!isMuted()) {
                audioObj.answer[0].play();
            }

            setTimeout(() => {
                let resultAudio: Howl;
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
                if (!isMuted()) {
                    resultAudio.play();
                }

                enableHtmlButtons();
                button.numberHistory.disabled = false;
                if (isFullscreen()) {
                    if (isTouchDevice()) { // タッチデバイス
                        calculateArea.addEventListener("touchend", (event) => {
                            event.preventDefault();
                            setFullscreenMode(false);
                        }, {once: true});
                        noticeArea.innerText = '画面をタッチすると戻ります。';
                    } else { // 非タッチデバイス
                        noticeArea.innerText = 'W キーを押すと戻ります。';
                    }
                }
            }, 1200);
        }

        return () => {
            inputAnswerBox.value = '';

            // モーダル表示時のイベント設定
            const listener = isTouchDevice()
                ? () => {
                    const modalFooter: HTMLDivElement | null = modals.input_answer.querySelector('.modal-footer');
                    if (modalFooter === null) {
                        throw new Error('element not found: modal footer')
                    }
                    modalFooter.style.display = 'none';
                    clearInputAnswerBox();
                    switchInputAnswerBoxTab.touchTab.click();
                    noticeInputAnswerNonTouchDevice.style.display = 'none';
                }
                : () => {
                    clearInputAnswerBox();
                    switchInputAnswerBoxTab.keyboardTab.click();
                    inputAnswerBox.focus();
                    noticeInputAnswerNonTouchDevice.style.display = 'block';
                };
            modals.input_answer.addEventListener('shown.bs.modal', listener);
            const modal = new bootstrap.Modal(modals.input_answer, {backdrop: false, keyboard: false, focus: true});
            modal.show();
            // 回答送信時のイベント設定
            if (isTouchDevice()) {
                const btnSendAnswer: HTMLButtonElement | null = document.querySelector('#input-answer-box-area-touch .btn-send-answer');
                if (btnSendAnswer === null) {
                    throw new Error('element not found: btn send answer')
                }
                btnSendAnswer.addEventListener('click', () => {
                    displayAnswer(inputAnswerBoxTouchActual.value, answer);
                    modal.hide();
                }, {once: true});
            } else {
                const listener = () => {
                    return (event: KeyboardEvent) => {
                        if (
                            document.activeElement?.id === 'input-answer-box'
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
    }

    const getFlashSuite = (numbersToDisplay: string[]) => {
        /**
         * 数字を表示させる順番を作成する。点滅なので数字・空文字の順番に配列に入れていく。
         * @param {string[]} fmtNumbers 整形された数字の配列
         * @returns {string[]} 点滅も含めた数字の表示順の配列
         */
        function generateToggleNumberSuite(fmtNumbers: string[]): string[] {
            let toggleNumberSuite: string[] = [];
            for (let i = 0; i < fmtNumbers.length; i++) {
                toggleNumberSuite.push(fmtNumbers[i]);
                toggleNumberSuite.push("");
            }
            return toggleNumberSuite;
        }

        /**
         * 画面の表示に合わせて鳴らす音の順番の配列を作成する。
         */
        function generateSoundSuite() {
            let sounds: (null | Howl)[] = [];
            for (let i = 0; i < requestParam.length; ++i) {
                sounds.push(isMuted() ? null : audioObj.tick[i]);
                sounds.push(null);
            }
            return sounds;
        }

        const result = Array.from({length: requestParam.length * 2}, () => {
            return {
                toggleNumberFunction: () => {
                },
                playTickFunction: () => {
                },
                _toggleTiming: 0,
            };
        })

        const toggleNumberSuite = generateToggleNumberSuite(numbersToDisplay);
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
        a => isMuted()
            ? () => {
            }
            : () => {
                a.play();
            }
    );

    // ここからフラッシュ出題の処理
    // 設定を取得する
    const question = FlashQuestionCreator.create(CurrentFlashMode.getInstance().value, option)
    const requestParam = question.paramSet
    const numbersToDisplay = question.flash.numbers.toDisplay()
    const flashAnswer = question.flash.answer
    const flashAnswerToDisplay = question.flash.answer.toDisplay()

    // 答えと出題数字履歴を作成する
    headerMessage.innerText = "";
    questionNumberArea.innerText = "";
    button.numberHistory.disabled = true;
    numberHistoryDisplay.innerHTML = numbersToDisplay.join("<br>");
    answerNumberDisplay.innerText = flashAnswerToDisplay;

    const start = getTime();

    function setFlashTimeOut(fn: () => void, delay: number) {
        const handle: { value?: number } = {};

        function loop() {
            const current = getTime();
            const delta = current - start;
            if (delta >= delay) {
                fn();
            } else {
                handle.value = requestAnimationFrame(loop);
            }
        }

        handle.value = requestAnimationFrame(loop);
        return handle;
    }

    // Register flash events
    disableHtmlButtons();
    setFullscreenMode(true);
    noticeArea.innerText = '';
    warmUpDisplayArea(0);
    const beforeBeepTime = 500;
    const beepInterval = 875;
    const flashStartTiming = beforeBeepTime + beepInterval * 2;
    const flashSuite = getFlashSuite(numbersToDisplay);
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
function warmUpDisplayArea(timeoutMs: number): number {
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
    inputAnswerBox.value = '';
    inputAnswerBoxTouchDisplay.value = '';
    inputAnswerBoxTouchActual.value = '';
}

(() => {
    // バージョン番号
    const version = 'v0.20.0';
    const warmupDelay = 1000;

    const setup = () => {
        audioObj.load(flashParamElements.common.soundExtension.valueV1);


        // ページ読み込み時処理
        (() => {
            let timeoutMs = warmUpDisplayArea(warmupDelay);
            const prepareGameFunctions = [
                () => changeMode('addition'),
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
                button.help.style.display = 'none';
            }
        })();

        // タッチデバイスの回答入力
        (() => {
            let inputs: string[] = [];

            function onKeyPress(button: string) {
                if (!button) {
                    console.error('button is empty')
                    return;
                }
                const matchedArray = button.match(/\d/g);
                if (!matchedArray) {
                    console.error('non-number key pressed')
                    return;
                }
                const matched = matchedArray[0];
                if (!matched) {
                    console.error('no key matched')
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
                inputAnswerBoxTouchDisplay.value = value === '' ? '0' : value;
                inputAnswerBoxTouchActual.value = value === '' ? '0' : value.replace(',', '');
            }

            const clearInput = () => {
                clearInputAnswerBox();
                inputs = [];
            };
            Array.from(document.getElementsByClassName("btn-clear-input-answer-box")).forEach(element => {
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
            const triggerTabs: Element[] = [].slice.call(document.querySelectorAll('#switchInputAnswerBoxTab button'));
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
            versionNumber.innerText = version;
        })();

        // set onclick events in index.html
        (() => {
            // フラッシュ操作
            button.start.addEventListener('click', () => flash())
            button.repeat.addEventListener('click', () => flash({repeat: true}))

            // モード切り替え
            button.addition.addEventListener('click', () => changeMode("addition"))
            // button.subtraction.addEventListener('click', () => changeMode(modeNames.subtraction))
            button.multiplication.addEventListener('click', () => changeMode("multiplication"))

            // 難易度切り替え
            button.difficulty.easy.addEventListener('click', () => {
                flashParamElements.common.difficulty.valueV1 = 'easy';
            })
            button.difficulty.normal.addEventListener('click', () => {
                flashParamElements.common.difficulty.valueV1 = 'normal';
            })
            button.difficulty.hard.addEventListener('click', () => {
                flashParamElements.common.difficulty.valueV1 = 'hard';
            })

            // サウンド
            button.isMuted.addEventListener('change', event => {
                flashParamElements.common.isMuted.valueV1 = (event.target as HTMLInputElement).checked;
            })

            // 出題設定読み込み
            button.doLoadParams.addEventListener('click', doLoadParams)
            button.doSaveParams.addEventListener('click', doSaveParams)
            button.doDeleteParams.addEventListener('click', doDeleteParams)
        })();
    };

    (() => {
        const button: HTMLButtonElement | null = document.querySelector('#welcomeModal .modal-footer > button');
        if (!button) {
            throw new Error('element not found: modal footer button')
        }

        button.addEventListener('click', setup);
        const welcomeModal = new bootstrap.Modal(modals.welcome, {backdrop: 'static', keyboard: false, focus: true});
        welcomeModal.show();
    })();
})();
