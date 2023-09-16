import { audioObj } from "../sound/sound.js"
import { type PlaySound } from "../sound/playSound.js"
import { type FlashParamSet } from "./flashParamSet.js"

export interface FlashSegment {
    fn: () => void
    delay: number
}

export type FlashSuite = FlashSegment[]

export interface GetFlashSuiteParams {
    playSound: PlaySound
    beforeBeepTime: number
    requestParam: FlashParamSet<any>
    toggleNumberFunctions: Array<() => void>
    flashStartTiming: number
    toggleTimings: number[]
    prepareAnswerInputFunc: () => void
}

export function getFlashSuite({
    playSound,
    beforeBeepTime,
    requestParam,
    toggleNumberFunctions,
    flashStartTiming,
    toggleTimings,
    prepareAnswerInputFunc,
}: GetFlashSuiteParams): FlashSuite {
    const flashSuite: FlashSuite = []
    flashSuite.push({
        fn: () => {
            audioObj.silence[0].play()
        },
        delay: 0,
    })
    flashSuite.push({
        fn: () => {
            playSound.play()
        },
        delay: beforeBeepTime - requestParam.offset,
    })
    for (let i = 0; i < requestParam.length * 2; i++) {
        flashSuite.push({
            fn: toggleNumberFunctions[i],
            delay: flashStartTiming + toggleTimings[i],
        })
    }
    flashSuite.push({
        fn: prepareAnswerInputFunc,
        delay: flashStartTiming + requestParam.time + 300,
    })
    return flashSuite
}
