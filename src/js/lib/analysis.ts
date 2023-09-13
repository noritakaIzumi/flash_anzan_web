/**
 * 平均を求める。
 * @param {number[]} data
 * @returns {number}
 */
export function average(data: number[]): number {
    let sum = 0
    for (let i = 0; i < data.length; ++i) {
        sum += data[i]
    }
    return sum / data.length
}

/**
 * 分散を求める。
 * @param {number[]} data
 * @returns {number}
 */
export function variance(data: number[]): number {
    const ave = average(data)
    let variance = 0
    for (let i = 0; i < data.length; i++) {
        variance += Math.pow(data[i] - ave, 2)
    }
    return variance / data.length
}

/**
 * 標準偏差を求める。
 * @param {number[]} data
 * @returns {number}
 */
export function standard_deviation(data: number[]): number {
    return Math.sqrt(variance(data))
}
