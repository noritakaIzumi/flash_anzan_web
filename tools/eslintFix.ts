import { ESLint } from "eslint"

export function eslintFix(filepath: string): void {
    // lint
    const eslint = new ESLint({ fix: true })
    void eslint.lintFiles(filepath).then(async results => {
        await ESLint.outputFixes(results)
    }).then(() => {
        console.log(`lint completed: ${filepath}`)
    })
}
