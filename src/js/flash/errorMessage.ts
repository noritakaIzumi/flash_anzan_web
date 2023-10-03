import { htmlElements } from '../dom/htmlElement.js'

const errorMessageMap = {
    difficultyNotSupported: '難易度設定がサポートされていない桁数です',
} as const

type ErrorMessageMapKey = keyof typeof errorMessageMap

export class ErrorMessage {
    private readonly htmlElement: HTMLDivElement
    private readonly errorsActivated: { [key in ErrorMessageMapKey]: boolean } = {
        difficultyNotSupported: false,
    }

    constructor(htmlElement: HTMLDivElement) {
        this.htmlElement = htmlElement
    }

    private render(): void {
        const messages = (Object.keys(this.errorsActivated) as ErrorMessageMapKey[])
            .map((key) => {
                return this.errorsActivated[key] ? errorMessageMap[key] : null
            })
            .filter((message) => message !== null)
        if (messages.length > 0) {
            this.htmlElement.classList.remove('d-none')
        } else {
            this.htmlElement.classList.add('d-none')
        }
        this.htmlElement.innerHTML = messages.join('<br>')
    }

    addError(key: ErrorMessageMapKey): void {
        this.errorsActivated[key] = true
        this.render()
    }

    removeError(key: ErrorMessageMapKey): void {
        this.errorsActivated[key] = false
        this.render()
    }
}

export const errorMessage = new ErrorMessage(htmlElements.errorMessage)
