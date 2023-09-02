(() => {
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

    function generateCarries(digitCount, length, mode) {
        function getRandomInt(digitCount) {
            const max = Math.pow(10, digitCount) - 1;
            const min = Math.pow(10, digitCount - 1);
            return Math.floor(Math.random() * (max - min + 1) + min);
        }

        switch (mode) {
            case 'multiplication': {
                let abacus = new Abacus();
                let carries = [];
                for (let i = 0; i < length; i++) {
                    const digits1 = String(getRandomInt(digitCount[0])).split('').reverse().map((n) => {
                        return Number(n);
                    });
                    const digits2 = String(getRandomInt(digitCount[1])).split('').reverse().map((n) => {
                        return Number(n);
                    });
                    for (let p1 = digits1.length - 1; p1 >= 0; p1--) {
                        for (let p2 = digits2.length - 1; p2 >= 0; p2--) {
                            abacus.add(digits1[p1] * digits2[p2] * Math.pow(10, p1 + p2));
                        }
                    }
                    carries.push(abacus.carry);
                    abacus = new Abacus(abacus.value);
                }
                return carries;
            }
            case 'addition':
                let abacus = new Abacus();
                let carries = [];
                for (let i = 0; i < length; i++) {
                    const number = getRandomInt(digitCount);
                    abacus = new Abacus(abacus.value).add(number);
                    carries.push(abacus.carry);
                }
                return carries;
            default:
        }
    }

    function getCalculateComplexity(carries, digit) {
        function average(data) {
            let sum = 0;
            for (let i = 0; i < data.length; ++i) {
                sum += data[i];
            }
            return sum / data.length;
        }

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

        if (typeof digit === 'object') {
            digit = digit[0] * digit[1];
        }

        carries = carries.map((c) => {
            return c / digit;
        });
        return average(carries) + standard_deviation(carries) * 0.25;
    }

    function getRank(arr, threshold) {
        const half = (arr.length / 2) | 0;
        const temp = arr.sort();

        return {
            med: (temp[half - 1] + temp[half]) / 2,
            hard: temp[Math.ceil(arr.length * (1 - threshold.hard))],
            easy: temp[Math.ceil(arr.length * (1 - threshold.easy))],
        };
    }

    function generateComplexity(digitCount, length, mode, sampleCount, threshold) {
        const c = [];
        for (let _ = 0; _ < sampleCount; _++) {
            const carries = generateCarries(digitCount, length, mode);
            const complexity = getCalculateComplexity(carries, digitCount);
            c.push(complexity);
        }

        return getRank(c, threshold);
    }

    // main
    const result = {addition: {}, multiplication: {}};
    const sampleCount = 10000;
    const threshold = {hard: 0.1, easy: 0.9};

    let mode = 'addition';
    for (let digitCount = 1; digitCount <= 14; ++digitCount) {
        for (let length = 2; length <= 30; ++length) {
            result.addition[`${digitCount}-${length}`] = generateComplexity(digitCount, length, mode, sampleCount, threshold);
            console.log(`${mode} ${digitCount} 桁 ${length} 口: completed`);
        }
    }

    mode = 'multiplication';
    for (let digitCount1 = 1; digitCount1 <= 7; digitCount1++) {
        for (let digitCount2 = 1; digitCount2 <= 7; digitCount2++) {
            for (let length = 2; length <= 30; length++) {
                const digitCount = [digitCount1, digitCount2];
                result.multiplication[`${digitCount1}-${digitCount2}-${length}`] = generateComplexity(digitCount, length, mode, sampleCount, threshold);
                console.log(`${mode} ${digitCount1} 桁× ${digitCount2} 桁 ${length} 口: completed`);
            }
        }
    }

    const path = require('path');
    const fs = require('fs');

    try {
        fs.writeFileSync(
            path.dirname(path.dirname(__filename)) + '/src/lib/complexity_map.js',
            `export const complexityMap = ${JSON.stringify(result)};\n`);
        console.log('write end');
    } catch (e) {
        console.log(e);
    }
})();
