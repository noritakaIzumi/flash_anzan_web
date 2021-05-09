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

    setQuestionInfoLabel();
}

function setUpInputBox() {
    Object.keys(element).map((mode) => {
        Object.keys(element[mode]).map((config) => {
            if (config === "time") {
                element[mode][config].max = param[mode][config].max / 1000;
                element[mode][config].min = param[mode][config].min / 1000;
                element[mode][config].value = param[mode][config].default / 1000;
                element[mode][config].step = param[mode][config].step / 1000;
            } else {
                element[mode][config].max = param[mode][config].max;
                element[mode][config].min = param[mode][config].min;
                element[mode][config].value = param[mode][config].default;
            }
            element[mode][config].oninput = setQuestionInfoLabel;
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

    setQuestionInfoLabel();
}

function setQuestionInfoLabel() {
    const currentParam = getCurrentParam();
    let labelText = '[現在の問題]\n';
    switch (currentMode.innerText) {
        case modeNames.addition:
            labelText += `たし算 ${currentParam.digit} 桁 `;
            break;
        case modeNames.multiplication:
            labelText += `かけ算 ${currentParam.digit[0]} 桁 × ${currentParam.digit[1]} 桁 `;
            break;
    }
    labelText += `${currentParam.length} 口 ${currentParam.time / 1000} 秒 \n`;
    labelText += `(flash rate: ${currentParam.flashRate} %, offset: ${currentParam.offset} ms)`;

    questionInfoLabel.innerText = labelText;
}

function expandCalculateArea() {
    calculateArea.classList.add('full-screen');
    questionNumberArea.classList.add('big-size-number');
    questionInfoLabel.classList.remove('display-none');
}

function contractCalculateArea() {
    questionInfoLabel.classList.add('display-none');
    questionNumberArea.classList.remove('big-size-number');
    calculateArea.classList.remove('full-screen');
}

function getCurrentParam() {
    let requestParam = {
        digit: 0,
        length: 0,
        time: 0,
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

function flash(config = {}) {
    // Functions
    function getFlashTime(length, time, flashRate) {
        const averageFlashTime = time / (length * 2);
        const flashOnTime = Number(averageFlashTime) * (flashRate / 50);
        const flashOffTime = Number(averageFlashTime) * ((100 - flashRate) / 50);
        return {on: flashOnTime, off: flashOffTime};
    }

    function generateNumbers(digit, length) {
        function getRandomInt(min, max) {
            min = Math.ceil(min);
            max = Math.floor(max);
            return min + Math.floor((max - min) * Math.random());
        }

        let numbers = [];
        for (let i = 0; i < length; ++i) {
            let min;
            let max;
            switch (currentMode.innerText) {
                case modeNames.multiplication:
                    min = [];
                    max = [];
                    min[0] = Math.pow(10, digit[0] - 1);
                    max[0] = Math.pow(10, digit[0]) - 1;
                    min[1] = Math.pow(10, digit[1] - 1);
                    max[1] = Math.pow(10, digit[1]) - 1;
                    numbers.push([getRandomInt(min[0], max[0]), getRandomInt(min[1], max[1])]);
                    break;
                case modeNames.addition:
                default:
                    min = Math.pow(10, digit - 1);
                    max = Math.pow(10, digit) - 1;
                    numbers.push(getRandomInt(min, max));
            }
        }
        return numbers;
    }

    function generateToggleNumberSuite(numbers) {
        let toggleNumberSuite = [];
        for (let i = 0; i < numbers.length; i++) {
            toggleNumberSuite.push(numbers[i]);
            toggleNumberSuite.push("");
        }
        return toggleNumberSuite;
    }

    function generateSounds() {
        let sounds = [];
        for (let i = 0; i < requestParam.length; ++i) {
            if (!isMuted.checked) {
                sounds.push(audioObj.tick[i]);
            } else {
                sounds.push(audioObj.silence[0]);
            }
            sounds.push(audioObj.silence[0]);
        }
        return sounds;
    }

    function disableButtons() {
        disableConfigTarget.map((element) => element.disabled = true);
    }

    function enableButtons() {
        disableConfigTarget.map((element) => element.disabled = false);
    }

    function displayAnswer(number) {
        if (number) {
            headerMessage.innerText = "あなたの答え：" + Number(number).toLocaleString();
        }

        button.repeat.disabled = true;
        if (!isMuted.checked) {
            audioObj.answer[0].play();
        }

        setTimeout(() => {
            let resultAudio;
            if (number === answerNumber.innerText) {
                resultAudio = audioObj.correct[0];
                headerMessage.innerText = "正解！（" + headerMessage.innerText + "）";
            } else if (number.length > 0) {
                resultAudio = audioObj.incorrect[0];
                headerMessage.innerText = "不正解...（" + headerMessage.innerText + "）";
            } else {
                resultAudio = audioObj.silence[0];
                headerMessage.innerText = "答え";
            }
            questionNumberArea.innerText = answerNumberDisplay.innerText;
            if (!isMuted.checked) {
                resultAudio.play();
            }

            enableButtons();
            button.numberHistory.disabled = false;
            if (isFullscreen()) {
                questionInfoLabel.classList.remove('display-none');
            }
        }, 1200);
    }

    function unveilInputAnswerArea() {
        button.openInputAnswer.click();
        inputAnswerBox.focus();
    }

    function checkAnswer() {
        modals.input_answer.addEventListener('hidden.bs.modal', () => {
            enableButtons();
            if (isFullscreen()) {
                questionInfoLabel.classList.remove('display-none');
            }
        }, {once: true});
        inputAnswerBox.addEventListener('keydown', submitNumber(), {once: true});
        inputAnswerBox.value = '';
        unveilInputAnswerArea();
    }

    function submitNumber() {
        return (event) => {
            if (event.key === "Enter") {
                button.closeInputAnswer.click();
                displayAnswer(inputAnswerBox.value.trim());
                return;
            }
            inputAnswerBox.addEventListener('keydown', submitNumber(), {once: true});
        };
    }

    // ここからフラッシュ出題の処理
    // 設定を取得する
    let requestParam = getCurrentParam();
    element[currentMode.innerText].length.value = requestParam.length;
    element[currentMode.innerText].time.value = requestParam.time / 1000;
    element.common.flashRate.value = requestParam.flashRate;
    element.common.offset.value = requestParam.offset;

    // 点灯時間と消灯時間を算出する
    const flashTime = getFlashTime(requestParam.length, requestParam.time, requestParam.flashRate);
    const flashOnTime = flashTime.on;
    const flashOffTime = flashTime.off;

    // 出題数字を生成、または前回の出題から読み込む
    let numbers;
    let numberHistory = numberHistoryString.innerText.split(numberHistoryStringifyDelimiter);
    let digitIsSame;
    const arrayDelimiter = ",";
    const firstNumberHistory = numberHistory[0];
    switch (currentMode.innerText) {
        case modeNames.multiplication:
            const splitFirstNumberHistory = firstNumberHistory.split(arrayDelimiter);
            if (!splitFirstNumberHistory[1]) {
                digitIsSame = false;
                break;
            }
            digitIsSame =
                requestParam.digit[0] === splitFirstNumberHistory[0].length
                && requestParam.digit[1] === splitFirstNumberHistory[1].length;
            numberHistory = numberHistory.map((p) => p.split(arrayDelimiter).map((n) => Number(n)));
            break;
        case modeNames.addition:
        default:
            digitIsSame = requestParam.digit === firstNumberHistory.length;
            numberHistory = numberHistory.map((n) => Number(n));
    }
    if (config.repeat && digitIsSame) {
        if (requestParam.length === numberHistory.length) {
            numbers = numberHistory;
        } else if (requestParam.length < numberHistory.length) {
            numbers = numberHistory.slice(0, requestParam.length);
        } else {
            numbers = numberHistory.concat(generateNumbers(requestParam.digit, requestParam.length - numberHistory.length));
        }
    } else {
        numbers = generateNumbers(requestParam.digit, requestParam.length);
    }
    let localeStringNumbers;
    switch (currentMode.innerText) {
        case modeNames.multiplication:
            localeStringNumbers = numbers.map((p) => p[0].toLocaleString() + multiplyFigure + p[1].toLocaleString());
            break;
        case modeNames.addition:
        default:
            localeStringNumbers = numbers.map((n) => n.toLocaleString());
    }

    // setFlashTimeOut に設定する関数を作成する
    const toggleNumberSuite = generateToggleNumberSuite(localeStringNumbers);
    const soundSuite = generateSounds();

    let toggleNumberFunctions = [];
    for (let i = 0; i < toggleNumberSuite.length; i++) {
        toggleNumberFunctions.push(() => {
            questionNumberArea.innerText = toggleNumberSuite[i];
        });
    }

    const playTickFunctions = [];
    for (let i = 0; i < soundSuite.length; i++) {
        playTickFunctions.push(() => {
            soundSuite[i].play();
        });
    }

    const flashTimes = [];
    for (let i = 0; i < soundSuite.length; i++) {
        if (i % 2 === 0) {
            flashTimes.push(flashOnTime);
        } else {
            flashTimes.push(flashOffTime);
        }
    }

    let playBeepFunctions = [];
    audioObj.beep.map((a) => {
        if (!isMuted.checked) {
            playBeepFunctions.push(() => {
                a.play();
            });
        } else {
            playBeepFunctions.push(() => {
            });
        }
    });

    // 答えと出題数字履歴を作成する
    headerMessage.innerText = "";
    questionNumberArea.innerText = "";
    questionInfoLabel.classList.add('display-none');
    button.numberHistory.disabled = true;
    switch (currentMode.innerText) {
        case modeNames.multiplication:
            answerNumber.innerText = numbers.reduce((a, b) => (a[1] ? a[0] * a[1] : a) + b[0] * b[1]);
            break;
        case modeNames.addition:
        default:
            answerNumber.innerText = numbers.reduce((a, b) => a + b);
    }
    numberHistoryDisplay.innerHTML = localeStringNumbers.join(numberHistoryDisplayDelimiter);
    numberHistoryString.innerText = numbers.join(numberHistoryStringifyDelimiter);
    answerNumberDisplay.innerText = Number(answerNumber.innerText).toLocaleString();

    const start = new Date().getTime();

    function setFlashTimeOut(fn, delay) {
        const handle = {};

        function loop() {
            const current = new Date().getTime();
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
    disableButtons();
    const beforeBeepTime = 500;
    const beepInterval = 875;
    const flashStartTiming = beforeBeepTime + beepInterval * 2;
    setFlashTimeOut(playBeepFunctions[0], beforeBeepTime - requestParam.offset);
    setFlashTimeOut(playBeepFunctions[1], beforeBeepTime + beepInterval - requestParam.offset);
    let toggleTiming = flashStartTiming;
    for (let i = 0; i < toggleNumberSuite.length; i++) {
        setFlashTimeOut(playTickFunctions[i], toggleTiming - requestParam.offset);
        setFlashTimeOut(toggleNumberFunctions[i], toggleTiming);
        toggleTiming += flashTimes[i];
    }
    setFlashTimeOut(checkAnswer, toggleTiming);
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

// ページ読み込み時処理
(() => {
    loadAudioObj(defaultAudioExtension);
    button.start.addEventListener('click', () => {
        audioContext.resume().then(() => {
        });
    });

    (() => {
        let timeoutMs = 2000;
        // フォントの読み込みに時間がかかるため，ウォーミングアップで 1 回見えない文字を光らせておく
        const currentNumberColor = questionNumberArea.style.color;
        const prepareGameFunctions = [
            () => questionNumberArea.style.color = "black",
            () => questionNumberArea.innerText = "0",
            () => questionNumberArea.innerText = "",
            () => questionNumberArea.style.color = currentNumberColor,
            setUpInputBox,
            () => button.start.disabled = false,
        ];
        prepareGameFunctions.map((func) => {
            setTimeout(func, timeoutMs);
            timeoutMs += 50;
        });
    })();

    // Register Shortcuts
    (() => {
        shortcut.add("ctrl+o", () => button.loadParams.click());
        shortcut.add("ctrl+s", () => button.saveParams.click());
        shortcut.add("ctrl+r", () => button.deleteParams.click());
        shortcut.add("s", () => button.start.click());
        shortcut.add("r", () => button.repeat.click());
        shortcut.add("z", () => button.addition.click());
        shortcut.add("x", () => button.subtraction.click());
        shortcut.add("c", () => button.multiplication.click());
        shortcut.add("n", () => button.numberHistory.click());
        shortcut.add("w", () => toggleFullscreenMode());
        shortcut.add("q", () => button.help.click());
        shortcut.add('ctrl+,', () => button.openCommonMoreConfig.click());
    })();

    // Modal Focusing
    (() => {
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
    })();
})();
