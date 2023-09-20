import { getTime } from "./time.js"
import { fonts } from "./dom/htmlElement.js"

export const loadStatusKey = ["sound", "font-abacus", "font-header-message"] as const
export type LoadStatusKey = typeof loadStatusKey[number]

export class LoadStatusManager {
    private status: { [key in LoadStatusKey]: boolean } = {
        "font-abacus": false,
        "font-header-message": false,
        sound: false,
    }

    markAsLoaded(key: LoadStatusKey): void {
        this.status[key] = true
    }

    private updateFontLoadStatus(): void {
        this.status["font-abacus"] = fonts.abacus.dataset.loaded === "1"
        this.status["font-header-message"] = fonts.kosugimaru.dataset.loaded === "1"
    }

    isAllLoaded(): boolean {
        this.updateFontLoadStatus()
        return Object.values(this.status).filter(loaded => !loaded).length <= 0
    }
}

export const loadStatusManager = new LoadStatusManager()

export async function waitLoaded(timeout: number = 0): Promise<void> {
    const start = getTime()
    let now: number

    async function doWaitLoaded(): Promise<void> {
        await new Promise<void>((resolve, reject) => {
            if (loadStatusManager.isAllLoaded()) {
                resolve()
                return
            }
            now = getTime()
            if (start + timeout < now) {
                reject(new Error("failed to load sounds/fonts"))
                return
            }
            setTimeout((): void => { doWaitLoaded().then(r => { resolve(r) }).catch(r => { reject(r) }) }, 100)
        })
    }

    await doWaitLoaded()
}
