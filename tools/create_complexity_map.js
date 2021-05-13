(() => {
    function generateComplexity(digit, length, sampleCount, threshold) {
        const mode = 'addition';

        function getRandomInt(min, max) {
            min = Math.ceil(min);
            max = Math.floor(max);
            return Math.floor(Math.random() * (max - min + 1) + min);
        }

        function median(arr, ratio) {
            const half = (arr.length / 2) | 0;
            const temp = arr.sort();

            if (ratio > 0) {
                return temp[Math.ceil(arr.length * ratio)];
            }

            if (temp.length % 2) {
                return temp[half];
            }
            return (temp[half - 1] + temp[half]) / 2;
        }

        function getCalculateComplexity(numbers) {
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

            let carries = [];
            switch (mode) {
                case 'multiplication':
                    return [];
                case 'addition':
                    let digits = [];
                    for (let i = 0; i < digit + 2; ++i) {
                        digits.push({value: 0, five: 0, one: 0});
                    }
                    for (let i = 0; i < numbers.length; ++i) {
                        let carry = 0;
                        const n = String(numbers[i]);
                        for (let j = 0; j < digits.length - 1; ++j) {
                            const beforeDigit = Object.assign({}, digits[j]);
                            digits[j].value += Number(n[j]) || 0;
                            if (digits[j].value >= 10) {
                                digits[j].value -= 10;
                                carry++;
                                digits[j + 1].value++;
                                if (digits[j + 1].value % 5 === 0) {
                                    carry++;
                                }
                            }
                            digits[j].five = Math.floor(digits[j].value / 5);
                            digits[j].one = digits[j].value % 5;
                            if ((digits[j].five - beforeDigit.five) * (digits[j].one - beforeDigit.one) < 0) {
                                carry++;
                            }
                        }
                        carries.push(carry / digit);
                    }
                    carries = carries.slice(1);
                    return average(carries) + standard_deviation(carries) * 0.25;
                default:
                    return [];
            }
        }

        let retry = 0;
        let numbers = [];
        const c = [];
        while (retry < sampleCount) {
            numbers = [];
            for (let i = 0; i < length; ++i) {
                let min;
                let max;
                switch (mode) {
                    case 'multiplication':
                        min = [];
                        max = [];
                        min[0] = Math.pow(10, digit[0] - 1);
                        max[0] = Math.pow(10, digit[0]) - 1;
                        min[1] = Math.pow(10, digit[1] - 1);
                        max[1] = Math.pow(10, digit[1]) - 1;
                        numbers.push([getRandomInt(min[0], max[0]), getRandomInt(min[1], max[1])]);
                        break;
                    case 'addition':
                    default:
                        min = Math.pow(10, digit - 1);
                        max = Math.pow(10, digit) - 1;
                        numbers.push(getRandomInt(min, max));
                }
            }
            const complexity = getCalculateComplexity(numbers);
            c.push(complexity);
            retry++;
        }

        return {
            med: median(c),
            hard: median(c, 1 - threshold.hard),
            easy: median(c, 1 - threshold.easy)
        };
    }

    // main
    const result = {};
    const sampleCount = 100000;
    const threshold = {hard: 0.1, easy: 0.9};

    for (let digit = 1; digit <= 14; ++digit) {
        for (let length = 2; length <= 30; ++length) {
            result[`${digit}-${length}`] = generateComplexity(digit, length, sampleCount, threshold);
        }
    }

    const path = require('path');
    const fs = require('fs');

    try {
        fs.writeFileSync(
            path.dirname(path.dirname(__filename)) + '/src/lib/complexity_map.js',
            `complexityMap = ${JSON.stringify(result)};\n`);
        console.log('write end');
    } catch (e) {
        console.log(e);
    }
})();
