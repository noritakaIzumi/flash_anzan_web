import {button, flashParamElements, modeNames} from "./globals";
import {switchDifficulty, toggleFullscreenMode} from "./util_should_categorize";

export function registerShortcuts() {
    shortcut.add("ctrl+o", () => button.loadParams.click());
    shortcut.add("ctrl+s", () => button.saveParams.click());
    shortcut.add("ctrl+r", () => button.deleteParams.click());
    shortcut.add("s", () => button.start.click());
    shortcut.add("r", () => button.repeat.click());
    shortcut.add("z", () => button.addition.click());
    shortcut.add("x", () => button.subtraction.click());
    shortcut.add("c", () => button.multiplication.click());
    shortcut.add("d", () => switchDifficulty('easy'));
    shortcut.add("f", () => switchDifficulty('normal'));
    shortcut.add("g", () => switchDifficulty('hard'));
    shortcut.add("n", () => button.numberHistory.click());
    shortcut.add("w", () => toggleFullscreenMode());
    shortcut.add("q", () => button.help.click());
    shortcut.add('ctrl+,', () => button.openCommonMoreConfig.click());
}

export function changeShortcut(mode) {
    ["y", "h", "u", "j", "i", "k", "o", "l", "shift+o", "shift+l", "ctrl+shift+o", "ctrl+shift+l"].map((key) => {
        shortcut.remove(key);
    });
    switch (mode) {
        case modeNames.multiplication:
            shortcut.add("y", () => flashParamElements.multiplication.digit1.increaseParam(1));
            shortcut.add("h", () => flashParamElements.multiplication.digit1.increaseParam(-1));
            shortcut.add("u", () => flashParamElements.multiplication.digit2.increaseParam(1));
            shortcut.add("j", () => flashParamElements.multiplication.digit2.increaseParam(-1));
            shortcut.add("i", () => flashParamElements.multiplication.length.increaseParam(1));
            shortcut.add("k", () => flashParamElements.multiplication.length.increaseParam(-1));
            shortcut.add("o", () => flashParamElements.multiplication.time.increaseParam(1000));
            shortcut.add("l", () => flashParamElements.multiplication.time.increaseParam(-1000));
            shortcut.add("shift+o", () => flashParamElements.multiplication.time.increaseParam(100));
            shortcut.add("shift+l", () => flashParamElements.multiplication.time.increaseParam(-100));
            shortcut.add("ctrl+shift+o", () => flashParamElements.multiplication.time.increaseParam(10));
            shortcut.add("ctrl+shift+l", () => flashParamElements.multiplication.time.increaseParam(-10));
            break;
        case modeNames.addition:
        default:
            shortcut.add("u", () => flashParamElements.addition.digit.increaseParam(1));
            shortcut.add("j", () => flashParamElements.addition.digit.increaseParam(-1));
            shortcut.add("i", () => flashParamElements.addition.length.increaseParam(1));
            shortcut.add("k", () => flashParamElements.addition.length.increaseParam(-1));
            shortcut.add("o", () => flashParamElements.addition.time.increaseParam(1000));
            shortcut.add("l", () => flashParamElements.addition.time.increaseParam(-1000));
            shortcut.add("shift+o", () => flashParamElements.addition.time.increaseParam(100));
            shortcut.add("shift+l", () => flashParamElements.addition.time.increaseParam(-100));
            shortcut.add("ctrl+shift+o", () => flashParamElements.addition.time.increaseParam(10));
            shortcut.add("ctrl+shift+l", () => flashParamElements.addition.time.increaseParam(-10));
    }
}