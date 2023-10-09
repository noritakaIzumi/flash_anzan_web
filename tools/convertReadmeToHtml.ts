import MarkdownIt = require('markdown-it')
import { fileURLToPath } from 'url'
import path from 'path'
import * as fs from 'fs'

const filename = fileURLToPath(import.meta.url)
const rootPath = path.dirname(path.dirname(filename))

const md = new MarkdownIt()
const content = fs.readFileSync(`${rootPath}/README.md`).toString()

const matched = content.match(/(?<=# \S+\n)[\s\S]*/)
if (matched === null) {
    throw new Error('title not found in README.md')
}
const matchedStr = matched.toString().trim()

const result = md
    .render(matchedStr)
    .replace(/<a.*?>/g, '')
    .replace(/<\/a>/g, '')

const filepath = `${rootPath}/src/html/readme.html`
fs.writeFileSync(filepath, result)

console.log(filepath)
