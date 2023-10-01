/* Global variables */

export const flashModes = ['addition', 'multiplication'] as const
export type FlashMode = typeof flashModes[number]

export interface FlashDigit {
    addition: number
    multiplication: [number, number]
}

export interface ComplexityThresholdMapKey {
    addition: `${number}-${number}`
    multiplication: `${number}-${number}-${number}`
}

export interface ComplexityThreshold {
    med: number
    hard: number
    easy: number
}

export type Complexity = ComplexityThreshold['easy' | 'hard']

export type ComplexityThresholdMapByMode<T extends FlashMode> = {
    [key in ComplexityThresholdMapKey[T]]: ComplexityThreshold
}

export type ComplexityThresholdMap = { [key in FlashMode]: ComplexityThresholdMapByMode<key> }

export const flashDifficulty = ['easy', 'normal', 'hard'] as const
export type FlashDifficulty = typeof flashDifficulty[number]
export type UnknownFlashDifficulty = 'unknown'

export const audioAttr = {
    directory: './sounds',
}

export const multiplyFigure = '*'

export const savedParamsKeyName = 'flash_anzan_params'

// 10 % の確率を連続で外す確率が 5000 分の 1 以下となる最小の回数
export const generateNumbersRetryLimit = 81
// console.log(((n: number) => {
//     const threshold = 0.02
//     return Math.pow(0.9, n - 1) * 100 > threshold
//         && Math.pow(0.9, n) * 100 <= threshold
// })(generateNumbersRetryLimit))

export const soundExtension = ['ogg', 'wav'] as const
export type SoundExtension = typeof soundExtension[number]

export const audioObjKey = ['beep', 'tick', 'answer', 'correct', 'incorrect', 'silence'] as const
export type AudioObjKey = typeof audioObjKey[number]
export type AudioFilename<T extends SoundExtension> = `${AudioObjKey}.${T}`
export type AudioPath<T extends SoundExtension = SoundExtension> = `${string}/${AudioFilename<T>}`
