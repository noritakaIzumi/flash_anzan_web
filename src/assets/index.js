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
    // Functions
    /**
     * 出題数字を作成する。
     * @param {number} digitCount 桁数
     * @param {number} length 口数
     * @param {string} difficulty 難易度
     * @returns {*[]|*}
     */
    function generateNumbers(digitCount, length, difficulty) {
        function getRandomDigit(excepts = []) {
            const d = [];
            for (let i = 0; i < 10; i++) {
                if (excepts.indexOf(i) >= 0) {
                    continue;
                }
                d.push(i);
            }
            return d[Math.floor(Math.random() * d.length)];
        }

        function getRandomInt(digitCount, previousNum = null, digitAllDifferent = false) {
            const previousNumDigits = String(previousNum).split('').reverse().map((n) => {
                return Number(n);
            });
            let digits = [getRandomDigit([0].concat(previousNumDigits.slice(-1)))];
            let i = 0;
            while (i < digitCount - 1) {
                let digit = null;
                if (digitCount <= 9 && digitAllDifferent) {
                    digit = getRandomDigit(digits.concat(previousNumDigits[i]));
                } else {
                    digit = getRandomDigit();
                }
                digits.push(digit);
                i++;
            }
            return Number(String(digits[0]) + digits.slice(1).reverse().join(''));
        }

        let retry = 0;
        while (retry < generateNumbersRetryLimit) {
            switch (currentMode.innerText) {
                case modeNames.multiplication: {
                    let numbers = [];
                    let abacus = new Abacus();
                    let carries = [];
                    for (let i = 0; i < length; i++) {
                        const number1 = getRandomInt(digitCount[0], numbers.length > 0 ? numbers.slice(-1)[0][0] : null, true);
                        const number2 = getRandomInt(digitCount[1], numbers.length > 0 ? numbers.slice(-1)[0][1] : null, true);
                        const digits1 = String(number1).split('').reverse().map((n) => {
                            return Number(n);
                        });
                        const digits2 = String(number2).split('').reverse().map((n) => {
                            return Number(n);
                        });
                        for (let p1 = digits1.length - 1; p1 >= 0; p1--) {
                            for (let p2 = digits2.length - 1; p2 >= 0; p2--) {
                                abacus.add(digits1[p1] * digits2[p2] * Math.pow(10, p1 + p2));
                            }
                        }
                        numbers.push([number1, number2]);
                        carries.push(abacus.carry);
                        abacus = new Abacus(abacus.value);
                    }

                    const complexityMapKey = `${digitCount[0]}-${digitCount[1]}-${length}`;
                    const complexity = getCalculateComplexity(carries, digitCount[0] * digitCount[1]);
                    switch (difficulty) {
                        case difficultyMap.easy:
                            if (complexity < complexityMap.multiplication[complexityMapKey][difficulty]) {
                                return numbers;
                            }
                            break;
                        case difficultyMap.normal:
                            if (complexity >= complexityMap.multiplication[complexityMapKey][difficultyMap.easy]
                                && complexity < complexityMap.multiplication[complexityMapKey][difficultyMap.hard]) {
                                return numbers;
                            }
                            break;
                        case difficultyMap.hard:
                            if (complexity >= complexityMap.multiplication[complexityMapKey][difficulty]) {
                                return numbers;
                            }
                            break;
                        default:
                            return [];
                    }

                    break;
                }
                case modeNames.addition:
                    const complexityMapKey = `${digitCount}-${length}`;
                    switch (difficulty) {
                        case difficultyMap.easy: {
                            let numbers = [];
                            let abacus = new Abacus();
                            let carries = [];
                            for (let i = 0; i < length; i++) {
                                while (true) {
                                    const number = getRandomInt(digitCount, numbers.slice(-1)[0], true);
                                    abacus = new Abacus(abacus.value).add(number);

                                    if (abacus.carry <= digitCount) {
                                        numbers.push(number);
                                        carries.push(abacus.carry);
                                        break;
                                    }
                                }
                            }

                            if (getCalculateComplexity(carries.slice(1), digitCount) < complexityMap.addition[complexityMapKey][difficulty]) {
                                return numbers;
                            }

                            break;
                        }
                        case difficultyMap.normal: {
                            let numbers = [];
                            let abacus = new Abacus();
                            let carries = [];
                            for (let i = 0; i < length; i++) {
                                const number = getRandomInt(digitCount, numbers.slice(-1)[0], true);
                                abacus = new Abacus(abacus.value).add(number);
                                numbers.push(number);
                                carries.push(abacus.carry);
                            }

                            const complexity = getCalculateComplexity(carries.slice(1), digitCount);
                            if (complexity >= complexityMap.addition[complexityMapKey][difficultyMap.easy]
                                && complexity < complexityMap.addition[complexityMapKey][difficultyMap.hard]) {
                                return numbers;
                            }

                            break;
                        }
                        case difficultyMap.hard: {
                            let numbers = [];
                            let abacus = new Abacus();
                            let carries = [];
                            for (let i = 0; i < length; i++) {
                                let getIntRetry = 0;
                                while (true) {
                                    const number = getRandomInt(digitCount);
                                    if (number === numbers.slice(-1)[0]) {
                                        continue;
                                    }

                                    abacus = new Abacus(abacus.value).add(number);

                                    if (i >= 1 && abacus.carry < digitCount && getIntRetry < 100) {
                                        getIntRetry++;
                                        continue;
                                    }

                                    numbers.push(number);
                                    carries.push(abacus.carry);
                                    break;
                                }
                            }

                            if (getCalculateComplexity(carries.slice(1), digitCount) >= complexityMap.addition[complexityMapKey][difficulty]) {
                                return numbers;
                            }

                            break;
                        }
                        default:
                            return [];
                    }
                    break;
                default:
                    return [];
            }
            retry++;
        }
        return numbers;
    }

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
            if (!muteIsOn()) {
                sounds.push(audioObj.tick[i]);
            } else {
                sounds.push(audioObj.silence[0]);
            }
            sounds.push(audioObj.silence[0]);
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
     */
    function displayAnswer(numberStr) {
        if (numberStr) {
            headerMessage.innerText = "あなたの答え：" + Number(numberStr).toLocaleString();
        }

        button.repeat.disabled = true;
        if (!muteIsOn()) {
            audioObj.answer[0].play();
        }

        setTimeout(() => {
            let resultAudio;
            if (numberStr === answerNumber.innerText) {
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
            questionNumberArea.innerText = answerNumberDisplay.innerText;
            if (!muteIsOn()) {
                resultAudio.play();
            }

            enableHtmlButtons();
            button.numberHistory.disabled = false;
            if (isFullscreen()) {
                if (isTouchDevice()) { // タッチデバイス
                    calculateArea.addEventListener("touchend", () => {
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
     */
    function prepareAnswerInput() {
        inputAnswerBox.value = '';
        (function unveilInputAnswerArea() {
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
                        displayAnswer(document.getElementById('input-answer-box-touch-actual').value);
                        modal.hide();
                    }, {once: true});
            } else {
                const listener = () => {
                    return (event) => {
                        if (
                            document.activeElement.id === 'input-answer-box'
                            && String(event.key).toLowerCase() === 'enter'
                        ) {
                            displayAnswer(inputAnswerBox.value);
                            modal.hide();
                            return;
                        }
                        document.addEventListener('keydown', listener(), {once: true});
                    };
                };
                document.addEventListener('keydown', listener(), {once: true});
            }
        })();
    }

    /**
     * 平均を求める。
     * @param {number[]} data
     * @returns {number}
     */
    function average(data) {
        let sum = 0;
        for (let i = 0; i < data.length; ++i) {
            sum += data[i];
        }
        return sum / data.length;
    }

    /**
     * 標準偏差を求める。
     * @param {number[]} data
     * @returns {number}
     */
    function standard_deviation(data) {
        function variance(data) {
            const ave = average(data);
            let variance = 0;
            for (let i = 0; i < data.length; i++) {
                variance += Math.pow(data[i] - ave, 2);
            }
            return variance / data.length;
        }

        return Math.sqrt(variance(data));
    }

    class AbacusDigit {
        constructor(value = 0, five = 0, one = 0) {
            this.value = value;
            this.five = five;
            this.one = one;
        }

        static getInstance() {
            return new AbacusDigit();
        }
    }

    /**
     * そろばんの珠を管理するクラス。
     */
    class Abacus {
        constructor(n = 0) {
            this.digits = Array(String(n).length).fill(AbacusDigit.getInstance());
            this.value = 0;
            this.carry = 0;
            this.add(n);
        }

        updateBeads(num) {
            const numArr = String(num).split('').map((d) => {
                return Number(d);
            });
            for (let i = numArr.length - 1; i >= 0; i--) {
                const d = numArr.shift();
                if (d === 0) {
                    continue;
                }

                if (this.digits[i] === undefined) {
                    this.digits[i] = AbacusDigit.getInstance();
                }

                const beforeDigit = Object.assign({}, this.digits[i]);
                let newVal = this.digits[i].value + d;
                if (newVal >= 10) {
                    newVal -= 10;
                    this.updateBeads(Math.pow(10, i + 1));
                    this.carry++;
                }
                this.digits[i] = new AbacusDigit(newVal, Math.floor(newVal / 5), newVal % 5);
                if ((this.digits[i].five - beforeDigit.five) * (this.digits[i].one - beforeDigit.one) < 0) {
                    this.carry++;
                }
            }
        }

        add(num) {
            this.updateBeads(num);
            this.value += num;
            return this;
        }
    }

    /**
     * 計算の複雑度を求める（繰り上がり回数などから算出）。
     * @param carries
     * @param digit
     * @returns {number}
     */
    function getCalculateComplexity(carries, digit) {
        carries = carries.map((c) => {
            return c / digit;
        });
        return average(carries) + standard_deviation(carries) * 0.25;
    }

    // ここからフラッシュ出題の処理
    // 設定を取得する
    let requestParam = getCurrentParam();
    element[currentMode.innerText].length.value = requestParam.length;
    element[currentMode.innerText].time.value = requestParam.time / 1000;
    element.common.flashRate.value = requestParam.flashRate;
    element.common.offset.value = requestParam.offset;

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
            numbers = numberHistory.concat(generateNumbers(requestParam.digit, requestParam.length - numberHistory.length, requestParam.difficulty));
        }
    } else {
        numbers = generateNumbers(requestParam.digit, requestParam.length, requestParam.difficulty);
    }

    /**
     * 表示用に整形した数字の配列
     * @type {string[]}
     */
    let localeStringNumbers;
    switch (currentMode.innerText) {
        case modeNames.multiplication:
            localeStringNumbers = numbers.map((p) => p[0].toLocaleString() + multiplyFigure + p[1].toLocaleString());
            break;
        case modeNames.addition:
        default:
            localeStringNumbers = numbers.map((n) => n.toLocaleString());
    }

    // Ref: http://yomotsu.net/blog/2013/01/05/fps.html
    // noinspection JSUnresolvedVariable
    const now = window.performance && (
        performance.now ||
        performance.mozNow ||
        performance.msNow ||
        performance.oNow ||
        performance.webkitNow
    );
    const getTime = function () {
        return (now && now.call(performance)) || (new Date().getTime());
    };

    // setFlashTimeOut に設定する関数を作成する
    const toggleNumberSuite = generateToggleNumberSuite(localeStringNumbers);
    const soundSuite = generateSoundSuite();

    let measuredTime = {start: 0, end: 0};
    let toggleNumberFunctions = [];
    toggleNumberFunctions.push(() => {
        measuredTime.start = getTime();
        questionNumberArea.innerText = toggleNumberSuite[0];
    });
    for (let i = 1; i < toggleNumberSuite.length - 1; i++) {
        toggleNumberFunctions.push(() => {
            questionNumberArea.innerText = toggleNumberSuite[i];
        });
    }
    toggleNumberFunctions.push(() => {
        questionNumberArea.innerText = toggleNumberSuite.slice(-1)[0];
        measuredTime.end = getTime();
    });

    const playTickFunctions = [];
    for (let i = 0; i < soundSuite.length; i++) {
        playTickFunctions.push(() => {
            soundSuite[i].play();
        });
    }

    const _toggleTimings = [];
    for (let i = 0; i < soundSuite.length; i++) {
        _toggleTimings.push(
            requestParam.time
            * (Math.floor(i / 2) * 100 + requestParam.flashRate * (i % 2))
            / ((requestParam.length - 1) * 100 + requestParam.flashRate)
        );
    }

    let playBeepFunctions = [];
    audioObj.beep.map((a) => {
        if (!muteIsOn()) {
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
    setTimeout(() => {
        audioObj.silence[0].play();
    }, 0);
    setFlashTimeOut(playBeepFunctions[0], beforeBeepTime - requestParam.offset);
    setFlashTimeOut(playBeepFunctions[1], beforeBeepTime + beepInterval - requestParam.offset);
    for (let i = 0; i < toggleNumberSuite.length; i++) {
        setFlashTimeOut(playTickFunctions[i], flashStartTiming + _toggleTimings[i] - requestParam.offset);
        setFlashTimeOut(toggleNumberFunctions[i], flashStartTiming + _toggleTimings[i]);
    }
    setFlashTimeOut(prepareAnswerInput, flashStartTiming + requestParam.time + 300);
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

// ページ読み込み時処理
(() => {
    loadAudioObj(param.common.soundExtension.default);
    button.start.addEventListener('click', () => {
        audioContext.resume().then(() => {
        });
    });

    (() => {
        let timeoutMs = warmUpDisplayArea(2000);
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

function clearInputAnswerBox() {
    document.getElementById('input-answer-box').value = '';
    document.getElementById('input-answer-box-touch-display').value = '';
    document.getElementById('input-answer-box-touch-actual').value = '';
}

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

    const Keyboard = window.SimpleKeyboard.default;
    new Keyboard({
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
