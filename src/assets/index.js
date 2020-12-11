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
                element.value = fixValue(param[currentMode.innerText][paramName + id.split("-")[2]], Math.floor(currentValue) + amount).toString();
            } else if (currentMode.innerText === modeNames.addition) {
                element.value = fixValue(param[currentMode.innerText][paramName], Math.floor(currentValue) + amount).toString();
            }
            return;
        case "length":
            element.value = fixValue(param[currentMode.innerText][paramName], Math.floor(currentValue) + amount).toString();
            return;
        case "time":
            element.value = (fixValue(param[currentMode.innerText][paramName], Math.round(currentValue * 1000) + amount) / 1000).toString();
            return;
        case "flashRate":
            element.value = fixValue(param[currentMode.innerText][paramName], currentValue + amount).toString();
            return;
    }
}

function setLimitAndDefaultValue() {
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
        });
    });
    currentMode.innerText = modeNames.addition;
    changeMode(currentMode.innerText);
}

function changeShortcut(mode) {
    ["y", "h", "u", "j", "i", "k", "o", "l", "shift+o", "shift+l", "ctrl+shift+o", "ctrl+shift+l", "p", "shift+p"].map((key) => {
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
    shortcut.add("p", () => increaseParam(mode + "-flashRate", 1));
    shortcut.add("shift+p", () => increaseParam(mode + "-flashRate", -1));
}

function changeMode(mode) {
    const buttonIdName = mode + '-button';
    const configIdName = mode + '-mode-config';
    const buttonTargetClassName = "btn-blue-active";
    const configTargetClassName = "display-none";
    const modeButtons = document.getElementById("mode-button-area").children;
    const configAreas = document.getElementById("mode-config-area").children;
    Array.from(modeButtons).map((element) => Array.from(element.classList).map((className) => {
        if (className === buttonTargetClassName) {
            element.classList.remove(className);
        }
    }));
    Array.from(configAreas).map((element) => element.classList.add(configTargetClassName));
    document.getElementById(buttonIdName).classList.add(buttonTargetClassName);
    document.getElementById(configIdName).classList.remove(configTargetClassName);
    changeShortcut(mode);
    currentMode.innerText = mode;
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
                sounds.push(new Audio());
            }
            sounds.push(new Audio());
        }
        return sounds;
    }

    function disableButtons() {
        button.start.disabled = true;
        button.repeat.disabled = true;
        disableConfigTarget.map((element) => element.disabled = true);
    }

    function enableButtons() {
        button.start.disabled = false;
        button.repeat.disabled = false;
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
            } else {
                resultAudio = audioObj.incorrect[0];
                headerMessage.innerText = "不正解...（" + headerMessage.innerText + "）";
            }
            questionNumberArea.innerText = Number(answerNumber.innerText).toLocaleString();
            resultAudio.play();

            button.start.disabled = false;
            button.repeat.disabled = false;
            disableConfigTarget.map((element) => element.disabled = false);

            button.numberHistory.disabled = false;
            resultSaved.style.display = "block";
        }, 1200);
    }

    function receiveInput() {
        const number = window.prompt("答えを入力してください（カンマは付けないでください）", "");
        if (number) {
            displayAnswer(number.trim());
        } else {
            enableButtons();
        }
    }

    // ここからフラッシュ出題の処理
    // 設定を取得する
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
                fixValue(param[currentMode.innerText].digit1, Math.floor(Number(element[currentMode.innerText].digit1.value))),
                fixValue(param[currentMode.innerText].digit2, Math.floor(Number(element[currentMode.innerText].digit2.value)))
            ];
            element[currentMode.innerText].digit1.value = requestParam.digit[0];
            element[currentMode.innerText].digit2.value = requestParam.digit[1];
            break;
        case modeNames.addition:
        default:
            requestParam.digit = fixValue(param[currentMode.innerText].digit, Math.floor(Number(element[currentMode.innerText].digit.value)));
            element[currentMode.innerText].digit.value = requestParam.digit;
    }
    requestParam.length = fixValue(param[currentMode.innerText].length, Math.floor(Number(element[currentMode.innerText].length.value)));
    requestParam.time = fixValue(param[currentMode.innerText].time, Number(element[currentMode.innerText].time.value) * 1000);
    requestParam.flashRate = fixValue(param[currentMode.innerText].flashRate, Number(element[currentMode.innerText].flashRate.value));
    requestParam.offset = fixValue(param[currentMode.innerText].offset, Number(element[currentMode.innerText].offset.value));
    element[currentMode.innerText].length.value = requestParam.length;
    element[currentMode.innerText].time.value = requestParam.time / 1000;
    element[currentMode.innerText].flashRate.value = requestParam.flashRate;
    element[currentMode.innerText].offset.value = requestParam.offset;

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

    // setTimeout に設定する関数を作成する
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
    if (!isMuted.checked) {
        audioObj.beep.map((a) => {
            playBeepFunctions.push(() => {
                a.play();
            });
        });
    } else {
        playBeepFunctions.push(() => {
        });
    }

    // 答えと出題数字履歴を作成する
    headerMessage.innerText = "";
    questionNumberArea.innerText = "";
    resultSaved.style.display = "none";
    numberHistoryArea.style.display = "none";
    previousMode.innerText = currentMode.innerText;
    switch (currentMode.innerText) {
        case modeNames.multiplication:
            answerNumber.innerText = numbers.reduce((a, b) => (a[1] ? a[0] * a[1] : a) + b[0] * b[1]);
            break;
        case modeNames.addition:
        default:
            answerNumber.innerText = numbers.reduce((a, b) => a + b);
    }
    numberHistoryDisplay.innerText = localeStringNumbers.join(numberHistoryDisplayDelimiter);
    numberHistoryString.innerText = numbers.join(numberHistoryStringifyDelimiter);

    // Register flash events
    const beforeBeepTime = 500;
    const beepInterval = 875;
    const flashStartTiming = beforeBeepTime + beepInterval * 2;
    setTimeout(disableButtons, 0);
    setTimeout(playBeepFunctions[0], beforeBeepTime - requestParam.offset);
    setTimeout(playBeepFunctions[1], beforeBeepTime + beepInterval - requestParam.offset);
    let toggleTiming = flashStartTiming;
    for (let i = 0; i < toggleNumberSuite.length; i++) {
        setTimeout(playTickFunctions[i], toggleTiming - requestParam.offset);
        setTimeout(toggleNumberFunctions[i], toggleTiming);
        toggleTiming += flashTimes[i];
    }
    setTimeout(receiveInput, toggleTiming);
}

function loadAudioObj(extension) {
    let timeoutMs = 100;
    let audioPath = '';
    Object.keys(audioObj).forEach((name) => {
        audioPath = `${audioAttr.directory}/${name}.${extension}`;
        for (let i = 0; i < audioObj[name].length; i++) {
            audioObj[name][i] = new Audio(audioPath);
            setTimeout(() => {
                audioObj[name][i].load();
            }, timeoutMs);
            timeoutMs += 10;
        }
    });
}

// ページ読み込み時処理
(() => {
    loadAudioObj(audioAttr.extension.ogg);

    (() => {
        let timeoutMs = 500;
        // フォントの読み込みに時間がかかるため，ウォーミングアップで 1 回見えない文字を光らせておく
        const currentNumberColor = questionNumberArea.style.color;
        const prepareGameFunctions = [
            () => questionNumberArea.style.color = "black",
            () => questionNumberArea.innerText = "0",
            () => questionNumberArea.innerText = "",
            () => questionNumberArea.style.color = currentNumberColor,
            setLimitAndDefaultValue,
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
    })();
})();
