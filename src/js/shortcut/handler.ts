import hotkeys from "hotkeys-js";

export interface ShortcutHandlerInterface {
    // ショートカットを追加する
    add(key: string, callback: () => any): void;

    // ショートカットを削除する
    remove(key: string): void;
}

class JaywcjloveShortcutHandler implements ShortcutHandlerInterface {
    add(key: string, callback: () => any): void {
        hotkeys(key, (event) => {
            event.preventDefault()
            callback()
        })
    }

    remove(key: string): void {
        hotkeys.unbind(key)
    }
}

export const shortcut = new JaywcjloveShortcutHandler()
