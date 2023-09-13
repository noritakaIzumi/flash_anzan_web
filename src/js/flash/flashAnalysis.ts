import { average, standardDeviation } from '../lib/analysis.js'

/**
 * 計算の複雑度を求める（繰り上がり回数などから算出）。
 * @param carries
 * @param digit
 * @returns {number}
 */
export function calculateComplexity(carries: number[], digit: number): number {
    carries = carries.map((c) => {
        return c / digit
    })
    return average(carries) + standardDeviation(carries) * 0.25
}
