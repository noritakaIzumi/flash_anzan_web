import { calculateComplexity } from "../src/js/flash/flashAnalysis.js"
import {
    type ComplexityThreshold,
    type ComplexityThresholdMap,
    type ComplexityThresholdMapKey,
    type FlashMode
} from "../src/js/globals.js"
import {
    AdditionModeUnknownDifficultyCreateRawNumbersAdapter,
    MultiplicationModeUnknownDifficultyCreateRawNumbersAdapter
} from "../src/js/flash/flashNumbers.js"
import * as fs from "fs"
import * as path from "path"
import { fileURLToPath } from "url"
import { flashParamSchema } from "../src/config/flashParamSchema.js"
import { eslintFix } from "./eslintFix.js"

const filename = fileURLToPath(import.meta.url)
const complexitySampleMapDir = path.dirname(path.dirname(filename)) + "/data/complexitySampleMap"

function getRank(numbers: number[], threshold: Threshold): ComplexityThreshold {
    const half = (numbers.length / 2) | 0
    const temp = numbers.sort((n1, n2) => n1 - n2)

    return {
        med: (temp[half - 1] + temp[half]) / 2,
        hard: temp[Math.ceil(numbers.length * (1 - threshold.hard))],
        easy: temp[Math.ceil(numbers.length * (1 - threshold.easy))],
    }
}

interface Threshold {
    hard: number
    easy: number
}

type ComplexitySampleMap = { [key1 in FlashMode]: { [key2 in ComplexityThresholdMapKey[key1]]: number[] } }

function complexitySampleFilepath<T extends FlashMode>(mode: T, mapKey: ComplexityThresholdMapKey[T]): string {
    return `${complexitySampleMapDir}/${mode}/${mapKey}.json`
}

function readComplexitySample<T extends FlashMode>(mode: T, mapKey: ComplexityThresholdMapKey[T]): number[] {
    const filepath = complexitySampleFilepath(mode, mapKey)
    return JSON.parse(fs.readFileSync(filepath, "utf-8"))
}

function writeComplexitySample<T extends FlashMode>(mode: T, mapKey: ComplexityThresholdMapKey[T], sample: number[]): void {
    const filepath = complexitySampleFilepath(mode, mapKey)
    fs.writeFileSync(filepath, JSON.stringify(sample, undefined, 2))
}

(() => {
    // main
    const importComplexitySampleMapFromFile: boolean = process.argv[2] === "reuse"
    const complexityThresholdMapFilepath = path.dirname(path.dirname(filename)) + "/src/js/lib/complexityThresholdMap.ts"

    const complexitySampleMap: ComplexitySampleMap = {
        addition: {},
        multiplication: {},
    }
    const complexityThresholdMap: ComplexityThresholdMap = {
        addition: {},
        multiplication: {},
    }

    const sampleCount = 10000
    const threshold: Threshold = {
        hard: 0.2,
        easy: 0.8,
    }

    let mode: FlashMode = "addition"
    if (!importComplexitySampleMapFromFile) {
        fs.mkdirSync(`${complexitySampleMapDir}/${mode}`, { recursive: true })
    }
    const additionModeParamSchema = flashParamSchema.addition
    for (let digitCount = additionModeParamSchema.digit.min; digitCount <= additionModeParamSchema.digit.difficultySupportMax; ++digitCount) {
        for (let length = additionModeParamSchema.length.min; length <= additionModeParamSchema.length.difficultySupportMax; ++length) {
            const mapKey: ComplexityThresholdMapKey["addition"] = `${digitCount}-${length}`
            if (importComplexitySampleMapFromFile) {
                complexitySampleMap[mode][mapKey] = readComplexitySample("addition", mapKey)
            } else {
                complexitySampleMap[mode][mapKey] = []
                for (let _ = 0; _ < sampleCount; _++) {
                    const rawNumbers = new AdditionModeUnknownDifficultyCreateRawNumbersAdapter().execute(digitCount, length)
                    const complexity = calculateComplexity(rawNumbers.carries, digitCount)
                    complexitySampleMap[mode][mapKey].push(complexity)
                }
                writeComplexitySample(mode, mapKey, complexitySampleMap[mode][mapKey])
            }
            complexityThresholdMap.addition[mapKey] = getRank(complexitySampleMap.addition[mapKey], threshold)
            console.log(`${mode} ${digitCount} 桁 ${length} 口: completed`)
        }
    }

    mode = "multiplication"
    if (!importComplexitySampleMapFromFile) {
        fs.mkdirSync(`${complexitySampleMapDir}/${mode}`, { recursive: true })
    }
    const multiplicationModeParamSchema = flashParamSchema.multiplication
    for (let digitCount1 = multiplicationModeParamSchema.digit1.min; digitCount1 <= multiplicationModeParamSchema.digit1.difficultySupportMax; digitCount1++) {
        for (let digitCount2 = multiplicationModeParamSchema.digit2.min; digitCount2 <= multiplicationModeParamSchema.digit2.difficultySupportMax; digitCount2++) {
            for (let length = multiplicationModeParamSchema.length.min; length <= multiplicationModeParamSchema.length.difficultySupportMax; length++) {
                const mapKey: ComplexityThresholdMapKey["multiplication"] = `${digitCount1}-${digitCount2}-${length}`
                const flippedMapKey: ComplexityThresholdMapKey["multiplication"] = `${digitCount2}-${digitCount1}-${length}`
                if (flippedMapKey in complexityThresholdMap.multiplication) {
                    complexitySampleMap[mode][mapKey] = complexitySampleMap[mode][flippedMapKey]
                    complexityThresholdMap[mode][mapKey] = complexityThresholdMap[mode][flippedMapKey]
                    console.log(`${mode} ${digitCount1} 桁× ${digitCount2} 桁 ${length} 口: ${digitCount2} 桁× ${digitCount1} 桁 ${length} 口 から copy`)
                    continue
                }
                if (importComplexitySampleMapFromFile) {
                    complexitySampleMap[mode][mapKey] = readComplexitySample("multiplication", mapKey)
                } else {
                    complexitySampleMap[mode][mapKey] = []
                    for (let _ = 0; _ < sampleCount; _++) {
                        const rawNumbers = new MultiplicationModeUnknownDifficultyCreateRawNumbersAdapter().execute([digitCount1, digitCount2], length)
                        const complexity = calculateComplexity(rawNumbers.carries, digitCount1 * digitCount2)
                        complexitySampleMap[mode][mapKey].push(complexity)
                    }
                    writeComplexitySample(mode, mapKey, complexitySampleMap[mode][mapKey])
                }
                complexityThresholdMap.multiplication[mapKey] = getRank(complexitySampleMap.multiplication[mapKey], threshold)
                console.log(`${mode} ${digitCount1} 桁× ${digitCount2} 桁 ${length} 口: completed`)
            }
        }
    }

    try {
        fs.writeFileSync(
            complexityThresholdMapFilepath,
            `
import { ComplexityThresholdMap } from "../globals.js"

export const complexityThresholdMap: ComplexityThresholdMap = ${JSON.stringify(complexityThresholdMap, undefined, 4)};
`.trim()
        )
        eslintFix(complexityThresholdMapFilepath)
        console.log("write end")
    } catch (e) {
        console.log(e)
    }
})()
