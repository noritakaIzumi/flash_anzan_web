import { audioObj, type SoundExtension } from "../sound/sound.js"
import { playSoundCreator } from "../sound/playSound.js"
import { type FlashParamSet } from "./flashParamSet.js"
import { type FlashMode } from "../globals.js"
import { measuredTime } from "./measuredTime.js"
import { getTime } from "../time.js"
import { questionNumberArea } from "../dom/htmlElement.js"
import { beepCount, beepInterval, firstBeepTiming } from "../../config/beepTiming.js"

export const getToggleTimings = (paramSet: FlashParamSet<FlashMode>): number[] => {
    const result: number[] = []
    for (let i = 0; i < paramSet.length * 2; i++) {
        result.push(paramSet.time *
            (Math.floor(i / 2) * 100 + paramSet.flashRate * (i % 2)) /
            ((paramSet.length - 1) * 100 + paramSet.flashRate)
        )
    }
    return result
}

export const getToggleNumberFunctions = (numbersToDisplay: string[]): Array<() => void> => {
    /**
     * 数字を表示させる順番を作成する。点滅なので数字・空文字の順番に配列に入れていく。
     * @param {string[]} fmtNumbers 整形された数字の配列
     * @returns {string[]} 点滅も含めた数字の表示順の配列
     */
    function generateToggleNumberSuite(fmtNumbers: string[]): string[] {
        const toggleNumberSuite: string[] = []
        for (let i = 0; i < fmtNumbers.length; i++) {
            toggleNumberSuite.push(fmtNumbers[i])
            toggleNumberSuite.push("")
        }
        return toggleNumberSuite
    }

    const result: Array<() => void> = []
    const toggleNumberSuite = generateToggleNumberSuite(numbersToDisplay)
    for (const [i, toggleNumber] of toggleNumberSuite.entries()) {
        if (i === 0) {
            result.push(() => {
                measuredTime.start = getTime()
                questionNumberArea.innerText = toggleNumber
            })
        } else if (i === toggleNumberSuite.length - 1) {
            result.push(() => {
                questionNumberArea.innerText = toggleNumber
                measuredTime.end = getTime()
            })
        } else {
            result.push(() => {
                questionNumberArea.innerText = toggleNumber
            })
        }
    }
    return result
}

export interface FlashSegment {
    fn: () => void
    delay: number
}

export type FlashSuite = FlashSegment[]

export interface GetFlashSuiteParams {
    soundExtension: SoundExtension
    paramSet: FlashParamSet<any>
    prepareAnswerInputFunc: () => void
    numbersToDisplay: string[]
}

export async function getFlashSuite({
    soundExtension,
    paramSet,
    prepareAnswerInputFunc,
    numbersToDisplay,
}: GetFlashSuiteParams): Promise<FlashSuite> {
    const toggleTimings = getToggleTimings(paramSet)
    const toggleNumberFunctions = getToggleNumberFunctions(numbersToDisplay)
    const beepSound = await playSoundCreator.createBeep({ soundExtension, beepInterval, beepCount })
    const tickSound = await playSoundCreator.createTick({ soundExtension, toggleTimings })

    const flashSuite: FlashSuite = []
    flashSuite.push({
        fn: () => {
            audioObj.silence[0].play()
        },
        delay: 0,
    })
    flashSuite.push({
        fn: () => {
            beepSound.play()
        },
        delay: firstBeepTiming - paramSet.offset,
    })
    const flashStartTiming = firstBeepTiming + beepInterval * beepCount
    flashSuite.push({
        fn: () => {
            tickSound.play()
        },
        delay: flashStartTiming - paramSet.offset,
    })
    for (let i = 0; i < paramSet.length * 2; i++) {
        flashSuite.push({
            fn: toggleNumberFunctions[i],
            delay: flashStartTiming + toggleTimings[i],
        })
    }
    flashSuite.push({
        fn: prepareAnswerInputFunc,
        delay: flashStartTiming + paramSet.time + 300,
    })
    return flashSuite
}
