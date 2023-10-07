import { type FlashMode } from '../globals.js'
import { toggleFullscreenMode } from '../screen.js'
import { shortcut } from './handler.js'
import { button, checkboxes } from '../dom/htmlElement.js'
import { flashParamElementsManagers } from '../flash/flashParamElementsManager.js'

export function registerShortcuts(): void {
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
    ;['y', 'h', 'u', 'j', 'i', 'k', 'o', 'l', 'shift+o', 'shift+l', 'ctrl+shift+o', 'ctrl+shift+l'].forEach((key) => {
        shortcut.remove(key)
    })
    switch (mode) {
        case 'multiplication':
            shortcut.add('y', () => {
                flashParamElementsManagers.multiplication.increaseDigit1(1)
            })
            shortcut.add('h', () => {
                flashParamElementsManagers.multiplication.increaseDigit1(-1)
            })
            shortcut.add('u', () => {
                flashParamElementsManagers.multiplication.increaseDigit2(1)
            })
            shortcut.add('j', () => {
                flashParamElementsManagers.multiplication.increaseDigit2(-1)
            })
            shortcut.add('i', () => {
                flashParamElementsManagers.multiplication.increaseLength(1)
            })
            shortcut.add('k', () => {
                flashParamElementsManagers.multiplication.increaseLength(-1)
            })
            shortcut.add('o', () => {
                flashParamElementsManagers.multiplication.increaseTime(1000)
            })
            shortcut.add('l', () => {
                flashParamElementsManagers.multiplication.increaseTime(-1000)
            })
            shortcut.add('shift+o', () => {
                flashParamElementsManagers.multiplication.increaseTime(100)
            })
            shortcut.add('shift+l', () => {
                flashParamElementsManagers.multiplication.increaseTime(-100)
            })
            shortcut.add('ctrl+shift+o', () => {
                flashParamElementsManagers.multiplication.increaseTime(10)
            })
            shortcut.add('ctrl+shift+l', () => {
                flashParamElementsManagers.multiplication.increaseTime(-10)
            })
            break
        case 'addition':
            shortcut.add('u', () => {
                flashParamElementsManagers.addition.increaseDigit(1)
            })
            shortcut.add('j', () => {
                flashParamElementsManagers.addition.increaseDigit(-1)
            })
            shortcut.add('i', () => {
                flashParamElementsManagers.addition.increaseLength(1)
            })
            shortcut.add('k', () => {
                flashParamElementsManagers.addition.increaseLength(-1)
            })
            shortcut.add('o', () => {
                flashParamElementsManagers.addition.increaseTime(1000)
            })
            shortcut.add('l', () => {
                flashParamElementsManagers.addition.increaseTime(-1000)
            })
            shortcut.add('shift+o', () => {
                flashParamElementsManagers.addition.increaseTime(100)
            })
            shortcut.add('shift+l', () => {
                flashParamElementsManagers.addition.increaseTime(-100)
            })
            shortcut.add('ctrl+shift+o', () => {
                flashParamElementsManagers.addition.increaseTime(10)
            })
            shortcut.add('ctrl+shift+l', () => {
                flashParamElementsManagers.addition.increaseTime(-10)
            })
            break
    }
}
