export const getHtmlElement = <K extends keyof HTMLElementTagNameMap>(tagName: K, id: string): HTMLElementTagNameMap[K] => {
    const element = document.getElementsByTagName(tagName).namedItem(id)
    if (!element) {
        throw new ReferenceError(`element does not exist (tagName: ${tagName}, id: ${id})`)
    }
    return element
};
