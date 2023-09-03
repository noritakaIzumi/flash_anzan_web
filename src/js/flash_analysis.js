/**
 * 平均を求める。
 * @param {number[]} data
 * @returns {number}
 */
export function average(data) {
    let sum = 0;
    for (let i = 0; i < data.length; ++i) {
        sum += data[i];
    }
    return sum / data.length;
}

/**
 * 分散を求める。
 * @param {number[]} data
 * @returns {number}
 */
export function variance(data) {
    const ave = average(data);
    let variance = 0;
    for (let i = 0; i < data.length; i++) {
        variance += Math.pow(data[i] - ave, 2);
    }
    return variance / data.length;
}

/**
 * 標準偏差を求める。
 * @param {number[]} data
 * @returns {number}
 */
export function standard_deviation(data) {
    return Math.sqrt(variance(data));
}

/**
 * 計算の複雑度を求める（繰り上がり回数などから算出）。
 * @param carries
 * @param digit
 * @returns {number}
 */
export function getCalculateComplexity(carries, digit) {
    carries = carries.map((c) => {
        return c / digit;
    });
    return average(carries) + standard_deviation(carries) * 0.25;
}
