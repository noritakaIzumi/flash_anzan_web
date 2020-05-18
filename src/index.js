// TODO: このファイルをクラス化して共通部分をまとめる
//  switch 文もまとめる

/* Global variables */

modeNames = {
    addition: "addition",
    multiplication: "multiplication",
};
limits = {
    addition: {
        digit: {
            upper: 14,
            lower: 1,
        },
        length: {
            upper: 30,
            lower: 2,
        },
        time: {
            upper: 30000,
            lower: 1000,
        },
        flashRate: {
            upper: 99,
            lower: 1,
        },
    },
    multiplication: {
        digit1: {
            upper: 7,
            lower: 1,
        },
        digit2: {
            upper: 7,
            lower: 1,
        },
        length: {
            upper: 30,
            lower: 2,
        },
        time: {
            upper: 30000,
            lower: 1000,
        },
        flashRate: {
            upper: 99,
            lower: 1,
        },
    }
};

answerTitle = document.getElementById("answer-title");
numberArea = document.getElementById("question-number-area");

startButton = document.getElementById("start-button");
answerButton = document.getElementById("answer-button");
repeatButton = document.getElementById("repeat-button");

disableConfigTarget = Array.from(document.getElementsByClassName("disable-config-target"));

resultSection = document.getElementById("result-section");
previousMode = document.getElementById("previous-mode");
answerNumber = document.getElementById("answer-number");
numberHistoryArea = document.getElementById("number-history-area");

soundDirectory = "./sound";
soundNameExtension = ".ogg";
beepSoundUrl = soundDirectory + "/beep" + soundNameExtension;
tickSoundUrl = soundDirectory + "/tick" + soundNameExtension;
answerSoundUrl = soundDirectory + "/answer" + soundNameExtension;

currentMode = document.getElementById("current-mode");

additionDigitElement = document.getElementById("addition-digit");
additionLengthElement = document.getElementById("addition-length");
additionTimeElement = document.getElementById("addition-time");
additionFlashRateElement = document.getElementById("addition-flashrate");
multiplicationDigit1Element = document.getElementById("multiplication-digit-1");
multiplicationDigit2Element = document.getElementById("multiplication-digit-2");
multiplicationLengthElement = document.getElementById("multiplication-length");
multiplicationTimeElement = document.getElementById("multiplication-time");
multiplicationFlashRateElement = document.getElementById("multiplication-flashrate");

multiplyFigure = "*";

numberHistoryDisplay = document.getElementById("number-history-display");
numberHistoryDisplayDelimiter = " → ";
numberHistoryString = document.getElementById("number-history-stringify");
numberHistoryStringifyDelimiter = "|";

numberHistoryButton = document.getElementById("number-history-button");
additionButton = document.getElementById("addition-button");
subtractionButton = document.getElementById("subtraction-button");
multiplicationButton = document.getElementById("multiplication-button");

(() => {
    // 先に音源を読み込む経験を積めば，ページ表示後最初から快適にプレイできるかもしれない．
    new Audio(beepSoundUrl).load();
    new Audio(tickSoundUrl).load();
    new Audio(answerSoundUrl).load();
    // フォントの読み込みに時間がかかるため，ウォーミングアップで 1 回見えない文字を光らせておく
    setTimeout(() => numberArea.style.color = "black", 25);
    setTimeout(() => numberArea.innerText = "0", 50);
    setTimeout(() => numberArea.innerText = "", 75);
    setTimeout(() => numberArea.style.color = "limegreen", 100);
})();

function fixValue(limit, targetValue) {
    return Math.floor(Math.min(limit.upper, Math.max(limit.lower, targetValue)));
}

function increaseParam(id, amount) {
    const element = document.getElementById(id);
    if (element.disabled) {
        return;
    }

    const currentValue = Number(element.value);
    const paramName = id.split("-")[1];
    switch (currentMode.innerText) {
        case modeNames.multiplication:
            switch (paramName) {
                case "digit":
                    switch (id.split("-")[2]) {
                        case "1":
                            element.value = fixValue(limits.multiplication.digit1, Math.floor(currentValue) + amount).toString();
                            return;
                        case "2":
                            element.value = fixValue(limits.multiplication.digit2, Math.floor(currentValue) + amount).toString();
                            return;
                    }
                    return;
                case "length":
                    element.value = fixValue(limits.multiplication.length, Math.floor(currentValue) + amount).toString();
                    return;
                case "time":
                    element.value = (fixValue(limits.multiplication.time, currentValue * 1000 + amount) / 1000).toString();
                    return;
                case "flashrate":
                    element.value = fixValue(limits.multiplication.flashRate, currentValue + amount).toString();
                    return;
            }
            break;
        case modeNames.addition:
        default:
            switch (paramName) {
                case "digit":
                    element.value = fixValue(limits.addition.digit, Math.floor(currentValue) + amount).toString();
                    return;
                case "length":
                    element.value = fixValue(limits.addition.length, Math.floor(currentValue) + amount).toString();
                    return;
                case "time":
                    element.value = (fixValue(limits.addition.time, currentValue * 1000 + amount) / 1000).toString();
                    return;
                case "flashrate":
                    element.value = fixValue(limits.addition.flashRate, currentValue + amount).toString();
                    return;
            }
    }
}

function setDefaultValue() {
    additionDigitElement.max = limits.addition.digit.upper;
    additionDigitElement.min = limits.addition.digit.lower;
    additionLengthElement.max = limits.addition.length.upper;
    additionLengthElement.min = limits.addition.length.lower;
    additionTimeElement.max = limits.addition.time.upper / 1000;
    additionTimeElement.min = limits.addition.time.lower / 1000;
    additionFlashRateElement.max = limits.addition.flashRate.upper;
    additionFlashRateElement.min = limits.addition.flashRate.lower;
    multiplicationDigit1Element.max = limits.multiplication.digit1.upper;
    multiplicationDigit1Element.min = limits.multiplication.digit1.lower;
    multiplicationDigit2Element.max = limits.multiplication.digit2.upper;
    multiplicationDigit2Element.min = limits.multiplication.digit2.lower;
    multiplicationLengthElement.max = limits.multiplication.length.upper;
    multiplicationLengthElement.min = limits.multiplication.length.lower;
    multiplicationTimeElement.max = limits.multiplication.time.upper / 1000;
    multiplicationTimeElement.min = limits.multiplication.time.lower / 1000;
    multiplicationFlashRateElement.max = limits.multiplication.flashRate.upper;
    multiplicationFlashRateElement.min = limits.multiplication.flashRate.lower;
    additionDigitElement.value = 1;
    additionLengthElement.value = 3;
    additionTimeElement.value = 5;
    additionTimeElement.step = 0.1;
    additionFlashRateElement.value = 60;
    multiplicationDigit1Element.value = 1;
    multiplicationDigit2Element.value = 1;
    multiplicationLengthElement.value = 2;
    multiplicationTimeElement.value = 5;
    multiplicationTimeElement.step = 0.1;
    multiplicationFlashRateElement.value = 60;

    currentMode.innerText = modeNames.addition;
    changeMode(currentMode.innerText);
}

setDefaultValue();

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
    const startButton = document.getElementById("start-button");
    const repeatButton = document.getElementById("repeat-button");

    let digitParam;
    let lengthParam;
    let timeMsParam;
    let flashRateParam;
    switch (currentMode.innerText) {
        case modeNames.multiplication:
            digitParam = [
                fixValue(limits.multiplication.digit1, Math.floor(Number(multiplicationDigit1Element.value))),
                fixValue(limits.multiplication.digit2, Math.floor(Number(multiplicationDigit2Element.value)))
            ];
            lengthParam = fixValue(limits.multiplication.length, Math.floor(Number(multiplicationLengthElement.value)));
            timeMsParam = fixValue(limits.multiplication.time, Number(multiplicationTimeElement.value) * 1000);
            flashRateParam = fixValue(limits.multiplication.flashRate, Number(multiplicationFlashRateElement.value));
            multiplicationDigit1Element.value = digitParam[0];
            multiplicationDigit2Element.value = digitParam[1];
            multiplicationLengthElement.value = lengthParam;
            multiplicationTimeElement.value = timeMsParam / 1000;
            multiplicationFlashRateElement.value = flashRateParam;
            break;
        case modeNames.addition:
        default:
            digitParam = fixValue(limits.addition.digit, Math.floor(Number(additionDigitElement.value)));
            lengthParam = fixValue(limits.addition.length, Math.floor(Number(additionLengthElement.value)));
            timeMsParam = fixValue(limits.addition.time, Number(additionTimeElement.value) * 1000);
            flashRateParam = fixValue(limits.addition.flashRate, Number(additionFlashRateElement.value));
            additionDigitElement.value = digitParam;
            additionLengthElement.value = lengthParam;
            additionTimeElement.value = timeMsParam / 1000;
            additionFlashRateElement.value = flashRateParam;
    }

    function getFlashTime(length, time, flashRate) {
        const averageFlashTime = time / (length * 2);
        const flashOnTime = Number(averageFlashTime) * (flashRate / 50);
        const flashOffTime = Number(averageFlashTime) * ((100 - flashRate) / 50);
        return {on: flashOnTime, off: flashOffTime};
    }

    // 点灯時間と消灯時間を算出する
    const flashTime = getFlashTime(lengthParam, timeMsParam, flashRateParam);
    const flashOnTime = flashTime.on;
    const flashOffTime = flashTime.off;

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
        for (let i = 0; i < lengthParam; ++i) {
            const tickSound = new Audio(tickSoundUrl);
            tickSound.load();
            sounds.push(tickSound);
            sounds.push(new Audio());
        }
        return sounds;
    }


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
                digitParam[0] === splitFirstNumberHistory[0].length
                && digitParam[1] === splitFirstNumberHistory[1].length;
            numberHistory = numberHistory.map((p) => p.split(arrayDelimiter).map((n) => Number(n)));
            break;
        case modeNames.addition:
        default:
            digitIsSame = digitParam === firstNumberHistory.length;
            numberHistory = numberHistory.map((n) => Number(n));
    }
    if (config.repeat && digitIsSame) {
        if (lengthParam === numberHistory.length) {
            numbers = numberHistory;
        } else if (lengthParam < numberHistory.length) {
            numbers = numberHistory.slice(0, lengthParam);
        } else {
            numbers = numberHistory.concat(generateNumbers(digitParam, lengthParam - numberHistory.length));
        }
    } else {
        numbers = generateNumbers(digitParam, lengthParam);
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
    const toggleNumberSuite = generateToggleNumberSuite(localeStringNumbers);
    const soundSuite = generateSounds();

    let toggleNumberFunctions = [];
    for (let i = 0; i < toggleNumberSuite.length; i++) {
        toggleNumberFunctions.push(() => {
            numberArea.innerText = toggleNumberSuite[i];
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

    function disableButtons() {
        startButton.disabled = true;
        repeatButton.disabled = true;
        answerButton.disabled = true;
        disableConfigTarget.map((element) => element.disabled = true);
    }

    function enableButtons() {
        repeatButton.disabled = false;
        answerButton.disabled = false;
    }

    let playBeepFunctions = [];
    for (let i = 0; i < 2; i++) {
        const beep = new Audio(beepSoundUrl);
        beep.load();
        playBeepFunctions.push(() => {
            beep.play().then(r => r);
        });
    }

    answerTitle.style.display = "none";
    numberArea.innerText = "";
    resultSection.style.display = "none";
    numberHistoryArea.style.display = "none";
    previousMode.innerText = currentMode.innerText;
    switch (currentMode.innerText) {
        case modeNames.multiplication:
            answerNumber.innerText = numbers.reduce((a, b) => (a[1] ? a[0] * a[1] : a) + b[0] * b[1]).toLocaleString();
            break;
        case modeNames.addition:
        default:
            answerNumber.innerText = numbers.reduce((a, b) => a + b).toLocaleString();
    }
    numberHistoryDisplay.innerText = localeStringNumbers.join(numberHistoryDisplayDelimiter);
    numberHistoryString.innerText = numbers.join(numberHistoryStringifyDelimiter);

    // Register flash events
    const offset = 500;
    const beepInterval = 875;
    const flashStartTiming = offset + beepInterval * 2;
    setTimeout(disableButtons, 0);
    setTimeout(playBeepFunctions[0], offset);
    setTimeout(playBeepFunctions[1], offset + beepInterval);
    let toggleTiming = flashStartTiming;
    for (let i = 0; i < toggleNumberSuite.length; i++) {
        setTimeout(toggleNumberFunctions[i], toggleTiming);
        setTimeout(playTickFunctions[i], toggleTiming);
        toggleTiming += flashTimes[i];
    }
    setTimeout(enableButtons, flashStartTiming + timeMsParam);
}

function displayAnswer() {
    answerButton.disabled = true;
    new Audio(answerSoundUrl).play().then(r => r);

    setTimeout(() => {
        answerTitle.style.display = "block";
        numberArea.innerText = answerNumber.innerText;

        startButton.disabled = false;
        disableConfigTarget.map((element) => element.disabled = false);

        numberHistoryButton.disabled = false;
        resultSection.style.display = "block";
    }, 1500);
}

function displayNumberHistoryArea() {
    numberHistoryButton.disabled = true;
    numberHistoryArea.style.display = "block";
}

// Shortcuts
shortcut.add("s", () => startButton.click());
shortcut.add("a", () => answerButton.click());
shortcut.add("r", () => repeatButton.click());

shortcut.add("z", () => additionButton.click());
shortcut.add("x", () => subtractionButton.click());
shortcut.add("c", () => multiplicationButton.click());

function changeShortcut(mode) {
    shortcut.remove("y");
    shortcut.remove("h");
    shortcut.remove("u");
    shortcut.remove("j");
    shortcut.remove("i");
    shortcut.remove("k");
    shortcut.remove("o");
    shortcut.remove("l");
    shortcut.remove("shift+o");
    shortcut.remove("shift+l");
    shortcut.remove("p");
    shortcut.remove("shift+p");
    switch (mode) {
        case modeNames.multiplication:
            shortcut.add("y", () => increaseParam(modeNames.multiplication + "-digit-1", 1));
            shortcut.add("h", () => increaseParam(modeNames.multiplication + "-digit-1", -1));
            shortcut.add("u", () => increaseParam(modeNames.multiplication + "-digit-2", 1));
            shortcut.add("j", () => increaseParam(modeNames.multiplication + "-digit-2", -1));
            shortcut.add("i", () => increaseParam(modeNames.multiplication + "-length", 1));
            shortcut.add("k", () => increaseParam(modeNames.multiplication + "-length", -1));
            shortcut.add("o", () => increaseParam(modeNames.multiplication + "-time", 1000));
            shortcut.add("l", () => increaseParam(modeNames.multiplication + "-time", -1000));
            shortcut.add("shift+o", () => increaseParam(modeNames.multiplication + "-time", 100));
            shortcut.add("shift+l", () => increaseParam(modeNames.multiplication + "-time", -100));
            shortcut.add("p", () => increaseParam(modeNames.multiplication + "-flashrate", 1));
            shortcut.add("shift+p", () => increaseParam(modeNames.multiplication + "-flashrate", -1));
            break;
        case modeNames.addition:
        default:
            shortcut.add("u", () => increaseParam(modeNames.addition + "-digit", 1));
            shortcut.add("j", () => increaseParam(modeNames.addition + "-digit", -1));
            shortcut.add("i", () => increaseParam(modeNames.addition + "-length", 1));
            shortcut.add("k", () => increaseParam(modeNames.addition + "-length", -1));
            shortcut.add("o", () => increaseParam(modeNames.addition + "-time", 1000));
            shortcut.add("l", () => increaseParam(modeNames.addition + "-time", -1000));
            shortcut.add("shift+o", () => increaseParam(modeNames.addition + "-time", 100));
            shortcut.add("shift+l", () => increaseParam(modeNames.addition + "-time", -100));
            shortcut.add("p", () => increaseParam(modeNames.addition + "-flashrate", 1));
            shortcut.add("shift+p", () => increaseParam(modeNames.addition + "-flashrate", -1));
    }
}

shortcut.add("n", () => numberHistoryButton.click());
