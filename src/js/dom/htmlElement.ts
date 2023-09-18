export function getHtmlElement<K extends keyof HTMLElementTagNameMap>(tagName: K, id: string): HTMLElementTagNameMap[K] {
    const element = document.getElementsByTagName(tagName).namedItem(id)
    if (element === null) {
        throw new ReferenceError(`element does not exist (tagName: ${tagName}, id: ${id})`)
    }
    return element
}

export const headerMessage = getHtmlElement("div", "header-message")
export const questionNumberArea = getHtmlElement("div", "question-number-area")
export const calculateArea = getHtmlElement("div", "calculate-area")
export const inputAnswerBox = getHtmlElement("input", "input-answer-box")
export const inputAnswerBoxTouchDisplay = getHtmlElement("div", "input-answer-box-touch-display")
export const inputAnswerBoxTouchActual = getHtmlElement("input", "input-answer-box-touch-actual")
export const noticeArea = getHtmlElement("p", "notice-area")
export const versionNumber = getHtmlElement("span", "version-number")
export const button = {
    loadParams: getHtmlElement("button", "load-params-button"),
    doLoadParams: getHtmlElement("button", "do-load-params"),
    saveParams: getHtmlElement("button", "save-params-button"),
    doSaveParams: getHtmlElement("button", "do-save-params"),
    deleteParams: getHtmlElement("button", "delete-params-button"),
    doDeleteParams: getHtmlElement("button", "do-delete-params"),
    start: getHtmlElement("button", "start-button"),
    repeat: getHtmlElement("button", "repeat-button"),
    numberHistory: getHtmlElement("button", "number-history-button"),
    addition: getHtmlElement("a", "pills-addition-tab"),
    subtraction: getHtmlElement("a", "pills-subtraction-tab"),
    multiplication: getHtmlElement("a", "pills-multiplication-tab"),
    closeInputAnswer: getHtmlElement("button", "closeInputAnswerModal"),
    help: getHtmlElement("button", "help-button"),
    openCommonMoreConfig: getHtmlElement("button", "open-common-more-config-button"),
    difficulty: {
        easy: getHtmlElement("input", "difficulty-easy"),
        normal: getHtmlElement("input", "difficulty-normal"),
        hard: getHtmlElement("input", "difficulty-hard"),
    },
    isMuted: getHtmlElement("input", "is-muted-button"),
    quit: getHtmlElement("button", "quit-button"),
}
export const disableConfigTarget = [
    button.start,
    button.repeat,
    button.loadParams,
    button.saveParams,
    button.deleteParams,
]
export const switchInputAnswerBoxTab = {
    touchTab: getHtmlElement("button", "switchInputAnswerBoxTab-touch-tab"),
    keyboardTab: getHtmlElement("button", "switchInputAnswerBoxTab-keyboard-tab"),
}
export const noticeInputAnswerNonTouchDevice = getHtmlElement("span", "notice-input-answer-non-touch-device")
export const numberHistoryDisplay = getHtmlElement("td", "number-history-display")
export const answerNumberDisplay = getHtmlElement("td", "answer-number-display")
export const paramsModalOperation = ["load", "save", "delete"] as const
export type ParamsModalOperation = typeof paramsModalOperation[number]
export const modals: {
    welcome: HTMLDivElement
    params: { [op in ParamsModalOperation]: { [phase in "confirm" | "complete"]: HTMLDivElement } }
    input_answer: HTMLDivElement
    number_history: HTMLDivElement
} = {
    welcome: getHtmlElement("div", "welcomeModal"),
    params: {
        load: {
            confirm: getHtmlElement("div", "loadParamsConfirmModal"),
            complete: getHtmlElement("div", "loadParamsCompletedModal"),
        },
        save: {
            confirm: getHtmlElement("div", "saveParamsConfirmModal"),
            complete: getHtmlElement("div", "saveParamsCompletedModal"),
        },
        delete: {
            confirm: getHtmlElement("div", "deleteParamsConfirmModal"),
            complete: getHtmlElement("div", "deleteParamsCompletedModal"),
        },
    },
    input_answer: getHtmlElement("div", "inputAnswerModal"),
    number_history: getHtmlElement("div", "numberHistoryModal"),
}
