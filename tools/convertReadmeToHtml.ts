import MarkdownIt = require('markdown-it')
import { fileURLToPath } from 'url'
import path from 'path'
import * as fs from 'fs'

const filename = fileURLToPath(import.meta.url)
const rootPath = path.dirname(path.dirname(filename))

const md = new MarkdownIt()
const content = fs.readFileSync(`${rootPath}/README.md`).toString()
const result = md.render(content)

const filepath = `${rootPath}/src/html/readme.html`
fs.writeFileSync(filepath, result)

console.log(filepath)
