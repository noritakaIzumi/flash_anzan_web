// noinspection SpellCheckingInspection
import audiosprite from "audiosprite"
import { fileURLToPath } from "url"
import path from "path"
import { type AudioPath, soundExtension, type SoundExtension } from "../src/js/globals.js"
import * as fs from "fs"

const filename = fileURLToPath(import.meta.url)
const soundsPath = `${path.dirname(path.dirname(filename))}/src/sounds`
const publicSoundsPath = `${path.dirname(path.dirname(filename))}/src/public/sounds`

// FIXME: types が format=howler2 に対応していないため、型を上書きして暫定対応
function getOpts(extension: SoundExtension): Omit<audiosprite.Option, "format"> & { format: audiosprite.ExportType | "howler2" } {
    return {
        output: `${publicSoundsPath}/flash`,
        path: "public/sounds",
        export: extension,
        format: "howler2",
        log: "debug",
        channels: 2,
    }
}

(() => {
    const targetFiles: { [ext in SoundExtension]: Array<AudioPath<ext>> } = {
        ogg: [
            `${publicSoundsPath}/answer.ogg`,
            `${publicSoundsPath}/correct.ogg`,
            `${publicSoundsPath}/incorrect.ogg`,
            `${publicSoundsPath}/silence.ogg`,
        ],
        wav: [
            `${publicSoundsPath}/answer.wav`,
            `${publicSoundsPath}/correct.wav`,
            `${publicSoundsPath}/incorrect.wav`,
            `${publicSoundsPath}/silence.wav`,
        ],
    }

    for (const ext of soundExtension) {
        const opts = getOpts(ext)
        // FIXME: 型を上書きして暫定対応
        audiosprite(targetFiles[ext], opts as audiosprite.Option, function (err: Error, obj: audiosprite.Result) {
            if (err) {
                console.error(err)
                return
            }

            fs.writeFileSync(`${soundsPath}/${opts.format}_${ext}.json`, JSON.stringify(obj, null, 2), {encoding: "utf-8"})
        })
    }
})()
