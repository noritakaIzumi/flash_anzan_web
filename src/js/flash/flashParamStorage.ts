import { type flashParamElementCategoryName, flashParamElements } from '../dom/flashParamElements.js'
import { savedParamsKeyName } from '../globals.js'
import { button, modals } from '../dom/htmlElement.js'

export function doLoadParams(): void {
    const modal = modals.params.load.complete
    const modalMessage = modal.querySelector('.modal-body > p')
    if (modalMessage === null) {
        throw new Error('element not found: modal message')
    }

    const loadedParams = localStorage.getItem(savedParamsKeyName)
    if (loadedParams === null) {
        modalMessage.innerHTML = '設定がありません'
        return
    }
    modalMessage.innerHTML = '設定を読み込みました'

    const parsedParams = JSON.parse(loadedParams)
    Object.keys(parsedParams).forEach((mode) => {
        switch (mode as keyof typeof flashParamElements) {
            case 'addition':
                flashParamElements.addition.digit.valueV0 = parsedParams.addition.digit
                flashParamElements.addition.length.valueV0 = parsedParams.addition.length
                flashParamElements.addition.time.valueV0 = parsedParams.addition.time
                break
            case 'multiplication':
                flashParamElements.multiplication.digit1.valueV0 = parsedParams.multiplication.digit1
                flashParamElements.multiplication.digit2.valueV0 = parsedParams.multiplication.digit2
                flashParamElements.multiplication.length.valueV0 = parsedParams.multiplication.length
                flashParamElements.multiplication.time.valueV0 = parsedParams.multiplication.time
                break
            case 'common':
                flashParamElements.common.difficulty.valueV0 = parsedParams.common.difficulty
                flashParamElements.common.offset.valueV0 = parsedParams.common.offset
                break
        }
    })

    // 難易度選択
    button.difficulty[flashParamElements.common.difficulty.valueV1].checked = true
}

export function doSaveParams(): void {
    const params: {
        [key in keyof typeof flashParamElementCategoryName]: Record<string, string>
    } = {
        addition: {},
        multiplication: {},
        common: {},
    }

    params.addition.digit = flashParamElements.addition.digit.valueV0
    params.addition.length = flashParamElements.addition.length.valueV0
    params.addition.time = flashParamElements.addition.time.valueV0
    params.multiplication.digit1 = flashParamElements.multiplication.digit1.valueV0
    params.multiplication.digit2 = flashParamElements.multiplication.digit2.valueV0
    params.multiplication.length = flashParamElements.multiplication.length.valueV0
    params.multiplication.time = flashParamElements.multiplication.time.valueV0
    params.common.difficulty = flashParamElements.common.difficulty.valueV0
    params.common.offset = flashParamElements.common.offset.valueV0

    localStorage.setItem(savedParamsKeyName, JSON.stringify(params))
}

export function doDeleteParams(): void {
    localStorage.removeItem(savedParamsKeyName)
}
