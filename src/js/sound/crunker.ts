import Crunker from 'crunker'

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-expect-error
let crunker: Crunker
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-expect-error
export function getCrunkerInstance(): Crunker {
    if (crunker === undefined) {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-expect-error
        crunker = new Crunker()
    }
    return crunker
}
