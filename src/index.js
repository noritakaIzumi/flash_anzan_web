const limits = {
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
};

function fixValue(limit, targetValue) {
    return Math.floor(Math.min(limit.upper, Math.max(limit.lower, targetValue)));
}

function increaseParam(id, amount) {
    const currentValue = Number(document.getElementById(id).value);

    switch (id) {
        case "digit":
            document.getElementById(id).value = fixValue(limits.digit, Math.floor(currentValue) + amount).toString();
            return;
        case "length":
            document.getElementById(id).value = fixValue(limits.length, Math.floor(currentValue) + amount).toString();
            return;
        case "time":
            document.getElementById(id).value = (fixValue(limits.time, currentValue * 1000 + amount) / 1000).toString();
            return;
        case "flashRate":
            document.getElementById(id).value = fixValue(limits.flashRate, currentValue + amount).toString();
            return;
    }
}

const answerTitle = document.getElementById("answer-title");
const numberArea = document.getElementById("number-area");

const startButton = document.getElementById("start-button");
const answerButton = document.getElementById("answer-button");
const repeatButton = document.getElementById("repeat-button");

const disableConfigTarget = Array.from(document.getElementsByClassName("disable-config-target"));

const resultSection = document.getElementById("result-section");
const answerNumber = document.getElementById("answer-number");
const numberHistoryArea = document.getElementById("number-history-area");

const soundDirectory = "./sound";
const beepSoundUrl = soundDirectory + "/beep.wav";
const tickSoundUrl = soundDirectory + "/tick.wav";
const answerSoundUrl = soundDirectory + "/answer.wav";

function flash(config = {}) {
    const startButton = document.getElementById("start-button");
    const repeatButton = document.getElementById("repeat-button");

    const numberHistoryDisplay = document.getElementById("number-history-display");
    const numberHistoryDisplayDelimiter = "\n";
    const numberHistoryString = document.getElementById("number-history-stringify");
    const numberHistoryStringifyDelimiter = "|";

    const digitElement = document.getElementById("digit");
    const digitParam = fixValue(limits.digit, Math.floor(Number(digitElement.value)));
    digitElement.value = digitParam;
    const lengthElement = document.getElementById("length");
    const lengthParam = fixValue(limits.length, Math.floor(Number(lengthElement.value)));
    lengthElement.value = lengthParam;
    const timeElement = document.getElementById("time");
    const timeMsParam = fixValue(limits.time, Number(timeElement.value) * 1000);
    timeElement.value = timeMsParam / 1000;
    const flashRateElement = document.getElementById("flash-rate");
    const flashRateParam = fixValue(limits.flashRate, Number(flashRateElement.value));
    flashRateElement.value = flashRateParam;

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
            const min = Math.pow(10, digit - 1);
            const max = Math.pow(10, digit) - 1;
            numbers.push(getRandomInt(min, max));
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
            sounds.push(new Audio(tickSoundUrl));
            sounds.push(new Audio());
        }
        return sounds;
    }

    let numbers;
    const numberHistory = numberHistoryString.innerText.split(numberHistoryStringifyDelimiter).map((n) => n ? Number(n) : "");
    if (config.repeat && digitParam === numberHistory[0].toString().length) {
        if (lengthParam === numberHistory.length) {
            numbers = numberHistory;
        } else if (lengthParam < numberHistory.length) {
            numbers = numberHistory.slice(0, lengthParam);
        } else {
            numbers = numberHistory.concat(generateNumbers(digitParam, lengthParam - numberHistory.length))
        }
    } else {
        numbers = generateNumbers(digitParam, lengthParam);
    }
    console.log(numbers); // わざと出力している
    const localeStringNumbers = numbers.map((n) => n.toLocaleString());
    const toggleNumberSuite = generateToggleNumberSuite(localeStringNumbers);
    const soundSuite = generateSounds();
    let index = 0;

    // setTimeout に登録するので，引数無しで実装する
    function toggleNumber() {
        numberArea.innerText = toggleNumberSuite[index];
        soundSuite[index].play();
        index++;
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

    const beep1 = new Audio(beepSoundUrl);
    const beep2 = new Audio(beepSoundUrl);

    function playBeep1() {
        beep1.play().then(r => r);
    }

    function playBeep2() {
        beep2.play().then(r => r);
    }

    // Register flash events
    const offset = 500;
    const beepInterval = 875;
    const flashStartTiming = offset + beepInterval * 2;
    setTimeout(disableButtons, 0);
    setTimeout(playBeep1, offset);
    setTimeout(playBeep2, offset + beepInterval);
    // 1 回目の表示が遅延することがあるので，ウォーミングアップで 1 回見えない文字を光らせておく
    setTimeout(() => numberArea.style.color = "black", flashStartTiming - 100);
    setTimeout(() => numberArea.innerText = "0", flashStartTiming - 75);
    setTimeout(() => numberArea.innerText = "", flashStartTiming - 50);
    setTimeout(() => numberArea.style.color = "limegreen", flashStartTiming - 25);
    let toggleTiming = flashStartTiming;
    for (let i = 0; i < localeStringNumbers.length; i++) {
        setTimeout(toggleNumber, toggleTiming);
        toggleTiming += flashOnTime;
        setTimeout(toggleNumber, toggleTiming);
        toggleTiming += flashOffTime;
    }
    setTimeout(enableButtons, flashStartTiming + timeMsParam);

    answerTitle.style.display = "none";
    numberArea.innerText = "";
    resultSection.style.display = "none";
    numberHistoryArea.style.display = "none";
    answerNumber.innerText = Number(numbers.reduce((a, b) => a + b)).toLocaleString();
    numberHistoryDisplay.innerText = localeStringNumbers.join(numberHistoryDisplayDelimiter);
    numberHistoryString.innerText = numbers.join(numberHistoryStringifyDelimiter);
}

function displayAnswer() {
    startButton.disabled = false;
    disableConfigTarget.map((element) => element.disabled = false);
    answerButton.disabled = true;
    answerTitle.style.display = "block";
    // resultSection.style.display = "block";
    numberArea.innerText = answerNumber.innerText;
    new Audio(answerSoundUrl).play().then(r => r);
}

function toggleNumberHistoryArea() {
    if (numberHistoryArea.style.display === "block") {
        numberHistoryArea.style.display = "none";
    } else {
        numberHistoryArea.style.display = "block";
    }
}

// Shortcuts
shortcut.add("s", () => startButton.click());
shortcut.add("a", () => answerButton.click());
shortcut.add("r", () => repeatButton.click());
