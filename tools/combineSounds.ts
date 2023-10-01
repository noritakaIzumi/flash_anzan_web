// noinspection SpellCheckingInspection
import audiosprite from 'audiosprite'
import { fileURLToPath } from 'url'
import path from 'path'
import { type AudioPath, soundExtension, type SoundExtension } from '../src/js/globals.js'
import * as fs from 'fs'
import { eslintFix } from './eslintFix.js'

const filename = fileURLToPath(import.meta.url)
const rootPath = path.dirname(path.dirname(filename))
const publicSoundsPath = `${rootPath}/src/public/sounds`

// FIXME: types が format=howler2 に対応していないため、型を上書きして暫定対応
function getOpts(
    extension: SoundExtension
): Omit<audiosprite.Option, 'format'> & { format: audiosprite.ExportType | 'howler2' } {
    return {
        output: `${publicSoundsPath}/flash_audiosprite`,
        path: 'sounds',
        export: extension,
        format: 'howler2',
        log: 'debug',
        channels: 2,
    }
}

function capitalize(string: string): string {
    return string.charAt(0).toUpperCase() + string.slice(1)
}

;(() => {
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
        audiosprite(
            targetFiles[ext],
            opts as audiosprite.Option,
            function (err: Error | null, obj: audiosprite.Result): void {
                if (err !== null) {
                    console.error(err)
                    return
                }

                const basename = `${opts.format}Option${capitalize(ext)}`
                const filepath = `${rootPath}/src/js/lib/${basename}.ts`
                const data = `
import { type HowlOptions } from "howler"

export const ${basename}: HowlOptions = ${JSON.stringify(obj, null, 2)}
`.trim()
                fs.writeFileSync(filepath, data, { encoding: 'utf-8' })
                eslintFix(filepath)
            }
        )
    }
})()
