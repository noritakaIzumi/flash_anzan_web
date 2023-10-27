export function getHtmlElement<K extends keyof HTMLElementTagNameMap>(
    tagName: K,
    id: string
): HTMLElementTagNameMap[K] {
    const element = document.getElementsByTagName(tagName).namedItem(id)
    if (element === null) {
        throw new ReferenceError(`element does not exist (tagName: ${tagName}, id: ${id})`)
    }
    return element
}

export const htmlElements = {
    soundExtension: getHtmlElement('select', 'sound-extension'),
    errorMessage: getHtmlElement('div', 'error-message'),
    inAppUpdateNotification: getHtmlElement('div', 'in-app-update-notification'),
}
export const headerMessage = getHtmlElement('div', 'header-message')
export const questionNumberArea = getHtmlElement('div', 'question-number-area')
export const calculateArea = getHtmlElement('div', 'calculate-area')
export const inputAnswerBox = getHtmlElement('input', 'input-answer-box')
export const inputAnswerBoxTouchDisplay = getHtmlElement('input', 'input-answer-box-touch-display')
export const inputAnswerBoxTouchActual = getHtmlElement('input', 'input-answer-box-touch-actual')
export const noticeArea = getHtmlElement('p', 'notice-area')
export const button = {
    start: getHtmlElement('button', 'start-button'),
    repeat: getHtmlElement('button', 'repeat-button'),
    numberHistory: getHtmlElement('button', 'number-history-button'),
    addition: getHtmlElement('a', 'pills-addition-tab'),
    subtraction: getHtmlElement('a', 'pills-subtraction-tab'),
    multiplication: getHtmlElement('a', 'pills-multiplication-tab'),
    help: getHtmlElement('button', 'help-button'),
    openCommonMoreConfig: getHtmlElement('button', 'open-common-more-config-button'),
    difficulty: {
        easy: getHtmlElement('input', 'difficulty-easy'),
        normal: getHtmlElement('input', 'difficulty-normal'),
        hard: getHtmlElement('input', 'difficulty-hard'),
    },
    openAppPage: getHtmlElement('button', 'open-app-page'),
    completeFlexibleUpdate: getHtmlElement('button', 'complete-flexible-update-button'),
}
export const disableConfigTarget = [button.start, button.repeat]
export const switchInputAnswerBoxTab = {
    touchTab: getHtmlElement('button', 'switchInputAnswerBoxTab-touch-tab'),
    keyboardTab: getHtmlElement('button', 'switchInputAnswerBoxTab-keyboard-tab'),
}
export const noticeInputAnswerNonTouchDevice = getHtmlElement('span', 'notice-input-answer-non-touch-device')
export const numberHistoryDisplay = getHtmlElement('td', 'number-history-display')
export const answerNumberDisplay = getHtmlElement('td', 'answer-number-display')
export const modals: {
    welcome: HTMLDivElement
    input_answer: HTMLDivElement
    number_history: HTMLDivElement
} = {
    welcome: getHtmlElement('div', 'welcomeModal'),
    input_answer: getHtmlElement('div', 'inputAnswerModal'),
    number_history: getHtmlElement('div', 'numberHistoryModal'),
}
export const fonts = {
    abacus: getHtmlElement('link', 'preload-font--abacus'),
    kosugimaru: getHtmlElement('link', 'preload-font--kosugimaru'),
}
export const checkboxes = {
    isMuted: getHtmlElement('input', 'is-muted'),
    fixNumberInterval: getHtmlElement('input', 'fix-number-interval'),
    hideAnswer: getHtmlElement('input', 'hide-answer'),
}
export const tooltips = {
    configOffset: getHtmlElement('span', 'config-offset-tooltip'),
}
