const limits = {
    digit: {
        upper: 8,
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

const answerButton = document.getElementById("answer-button");
const answerArea = document.getElementById("answer-area");
const numberHistoryArea = document.getElementById("number-history-area");

const soundDirectory = "./sound";
const beepSoundUrl = soundDirectory + "/beep.wav";
const tickSoundUrl = soundDirectory + "/tick.wav";
const answerSoundUrl = soundDirectory + "/answer.wav";

function flash(config = {}) {
    const startButton = document.getElementById("start-button");
    const repeatButton = document.getElementById("repeat-button");
    const numberArea = document.getElementById("number-area");

    const numberHistoryDisplay = document.getElementById("number-history-display");
    const numberHistoryDisplayDelimiter = "\n";
    const numberHistoryString = document.getElementById("number-history-stringify");
    const numberHistoryStringifyDelimiter = "|";

    const digit = fixValue(limits.digit, Math.floor(Number(document.getElementById("digit").value)));
    const length = fixValue(limits.length, Math.floor(Number(document.getElementById("length").value)));
    const time = fixValue(limits.time, Number(document.getElementById("time").value) * 1000);
    const flashRate = fixValue(limits.flashRate, Number(document.getElementById("flash-rate").value));

    function getFlashTime(length, time, flashRate) {
        const averageFlashTime = time / (length * 2);
        const flashOnTime = Number(averageFlashTime) * (flashRate / 50);
        const flashOffTime = Number(averageFlashTime) * ((100 - flashRate) / 50);
        return {on: flashOnTime, off: flashOffTime};
    }

    const flashTime = getFlashTime(length, time, flashRate);
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
        numbers.push("");
        return numbers;
    }

    function generateSounds() {
        let sounds = [];
        for (let i = 0; i < length; ++i) {
            sounds.push(new Audio(tickSoundUrl));
        }
        sounds.push(new Audio());
        return sounds;
    }

    let numbers;
    if (config.repeat) {
        numbers = numberHistoryString.innerText.split(numberHistoryStringifyDelimiter).map((n) => n ? Number(n) : "");
    } else {
        numbers = generateNumbers(digit, length);
    }
    const localeStringNumbers = numbers.map((n) => n.toLocaleString());
    const sounds = generateSounds();
    let index = 0;
    let flag = 0;

    function toggleNumber() {
        if (index >= localeStringNumbers.length) {
            return;
        }

        if (flag === 0) {
            numberArea.innerText = localeStringNumbers[index];
            sounds[index].play();
            index++;
            flag = 1;
            setTimeout(toggleNumber, flashOnTime);
        } else {
            numberArea.innerText = "";
            flag = 0;
            setTimeout(toggleNumber, flashOffTime);
        }
    }

    function disableButtons() {
        startButton.disabled = true;
        repeatButton.disabled = true;
        answerButton.disabled = true;
    }

    function enableButtons() {
        startButton.disabled = false;
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

    const offset = 500;
    const beepInterval = 875;
    const flashStartTiming = offset + beepInterval * 2;
    setTimeout(disableButtons, 0);
    setTimeout(playBeep1, offset);
    setTimeout(playBeep2, offset + beepInterval);
    setTimeout(() => numberArea.style.color = "black", flashStartTiming - 100);
    setTimeout(() => numberArea.innerText = "0", flashStartTiming - 75);
    setTimeout(() => numberArea.innerText = "", flashStartTiming - 50);
    setTimeout(() => numberArea.style.color = "limegreen", flashStartTiming - 25);
    setTimeout(toggleNumber, flashStartTiming);
    setTimeout(enableButtons, flashStartTiming + time);

    numberArea.innerText = "";
    answerArea.style.display = "none";
    numberHistoryArea.style.display = "none";
    const sum = Number(numbers.reduce((a, b) => a + b));
    document.getElementById("sum").innerText = sum.toLocaleString();
    numberHistoryDisplay.innerText = localeStringNumbers.join(numberHistoryDisplayDelimiter);
    numberHistoryString.innerText = numbers.join(numberHistoryStringifyDelimiter);
}

function displayAnswer() {
    answerButton.disabled = true;
    answerArea.style.display = "block";
    new Audio(answerSoundUrl).play().then(r => r);
}

function toggleNumberHistoryArea() {
    if (numberHistoryArea.style.display === "block") {
        numberHistoryArea.style.display = "none";
    } else {
        numberHistoryArea.style.display = "block";
    }
}
