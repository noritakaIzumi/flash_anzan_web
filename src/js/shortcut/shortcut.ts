import { type FlashMode } from '../globals.js'
import { toggleFullscreenMode } from '../screen.js'
import { shortcut } from './handler.js'
import { button, checkboxes } from '../dom/htmlElement.js'
import {
    additionModeFlashParamElementsManager,
    multiplicationModeFlashParamElementsManager
} from '../flash/flashParamElementsManager.js'

export function registerShortcuts(): void {
    shortcut.add('ctrl+o', () => {
        button.loadParams.click()
    })
    shortcut.add('ctrl+s', () => {
        button.saveParams.click()
    })
    shortcut.add('ctrl+r', () => {
        button.deleteParams.click()
    })
    shortcut.add('s', () => {
        button.start.click()
    })
    shortcut.add('r', () => {
        button.repeat.click()
    })
    shortcut.add('z', () => {
        button.addition.click()
    })
    shortcut.add('x', () => {
        button.subtraction.click()
    })
    shortcut.add('c', () => {
        button.multiplication.click()
    })
    shortcut.add('d', () => {
        button.difficulty.easy.click()
    })
    shortcut.add('f', () => {
        button.difficulty.normal.click()
    })
    shortcut.add('g', () => {
        button.difficulty.hard.click()
    })
    shortcut.add('n', () => {
        button.numberHistory.click()
    })
    shortcut.add('w', () => {
        toggleFullscreenMode()
    })
    shortcut.add('q', () => {
        button.help.click()
    })
    shortcut.add('ctrl+,', () => {
        button.openCommonMoreConfig.click()
    })
    shortcut.add('shift+n', () => {
        checkboxes.fixNumberInterval.click()
    })
    shortcut.add('shift+m', () => {
        checkboxes.hideAnswer.click()
    })
}

export function changeShortcut(mode: FlashMode): void {
    ['y', 'h', 'u', 'j', 'i', 'k', 'o', 'l', 'shift+o', 'shift+l', 'ctrl+shift+o', 'ctrl+shift+l'].forEach(key => {
        shortcut.remove(key)
    })
    switch (mode) {
        case 'multiplication':
            shortcut.add('y', () => {
                multiplicationModeFlashParamElementsManager.increaseDigit1(1)
            })
            shortcut.add('h', () => {
                multiplicationModeFlashParamElementsManager.increaseDigit1(-1)
            })
            shortcut.add('u', () => {
                multiplicationModeFlashParamElementsManager.increaseDigit2(1)
            })
            shortcut.add('j', () => {
                multiplicationModeFlashParamElementsManager.increaseDigit2(-1)
            })
            shortcut.add('i', () => {
                multiplicationModeFlashParamElementsManager.increaseLength(1)
            })
            shortcut.add('k', () => {
                multiplicationModeFlashParamElementsManager.increaseLength(-1)
            })
            shortcut.add('o', () => {
                multiplicationModeFlashParamElementsManager.increaseTime(1000)
            })
            shortcut.add('l', () => {
                multiplicationModeFlashParamElementsManager.increaseTime(-1000)
            })
            shortcut.add('shift+o', () => {
                multiplicationModeFlashParamElementsManager.increaseTime(100)
            })
            shortcut.add('shift+l', () => {
                multiplicationModeFlashParamElementsManager.increaseTime(-100)
            })
            shortcut.add('ctrl+shift+o', () => {
                multiplicationModeFlashParamElementsManager.increaseTime(10)
            })
            shortcut.add('ctrl+shift+l', () => {
                multiplicationModeFlashParamElementsManager.increaseTime(-10)
            })
            break
        case 'addition':
            shortcut.add('u', () => {
                additionModeFlashParamElementsManager.increaseDigit(1)
            })
            shortcut.add('j', () => {
                additionModeFlashParamElementsManager.increaseDigit(-1)
            })
            shortcut.add('i', () => {
                additionModeFlashParamElementsManager.increaseLength(1)
            })
            shortcut.add('k', () => {
                additionModeFlashParamElementsManager.increaseLength(-1)
            })
            shortcut.add('o', () => {
                additionModeFlashParamElementsManager.increaseTime(1000)
            })
            shortcut.add('l', () => {
                additionModeFlashParamElementsManager.increaseTime(-1000)
            })
            shortcut.add('shift+o', () => {
                additionModeFlashParamElementsManager.increaseTime(100)
            })
            shortcut.add('shift+l', () => {
                additionModeFlashParamElementsManager.increaseTime(-100)
            })
            shortcut.add('ctrl+shift+o', () => {
                additionModeFlashParamElementsManager.increaseTime(10)
            })
            shortcut.add('ctrl+shift+l', () => {
                additionModeFlashParamElementsManager.increaseTime(-10)
            })
            break
    }
}
