import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const STATES = { ' ': 'todo', '~': 'doing', x: 'done', X: 'done' }

function fail(message) {
  console.error(message)
  process.exit(1)
}

function tally(items) {
  const done = items.filter((item) => item.state === 'done').length
  const doing = items.filter((item) => item.state === 'doing').length
  // Floor so the page never shows 100% while a box is still open.
  const pct = items.length ? Math.floor((done / items.length) * 100) : 0
  return { done, doing, total: items.length, pct }
}

function parse(markdown) {
  let title = ''
  let section = null
  let item = null
  const sections = []
  for (const line of markdown.split('\n')) {
    const heading = line.match(/^(#{1,2}) (.+)/)
    const box = line.match(/^- \[([ ~xX])\] (.+)/)
    if (heading?.[1] === '#') {
      title ||= heading[2].trim()
    } else if (heading) {
      section = { name: heading[2].trim(), items: [] }
      sections.push(section)
      item = null
    } else if (box) {
      if (!section) sections.push((section = { name: '', items: [] }))
      const [, id = '', text] = box[2].match(/^(?:([A-Za-z]+\d+(?:\.\d+)*)\s+[·:—-]\s+)?(.+)$/)
      item = { id, title: text.trim(), state: STATES[box[1]], details: [] }
      section.items.push(item)
    } else if (item && /^\s+\S/.test(line)) {
      item.details.push(line.trim().replace(/^[-*] /, ''))
    } else if (line.trim()) {
      item = null
    }
  }
  const counted = sections.filter((s) => s.items.length).map((s) => ({ ...s, ...tally(s.items) }))
  return { title, sections: counted, ...tally(counted.flatMap((s) => s.items)) }
}

const dir = process.argv[2]
if (!dir) fail('Usage: node progress.mjs <work folder>')
const mode = ['tasks', 'goal'].find((name) => existsSync(join(dir, `${name}.md`)))
if (!mode) fail(`No tasks.md or goal.md in ${dir}`)

const data = { mode, updated: new Date().toISOString(), ...parse(readFileSync(join(dir, `${mode}.md`), 'utf8')) }
const template = readFileSync(join(dirname(fileURLToPath(import.meta.url)), 'template.html'), 'utf8')
const json = JSON.stringify(data).replace(/</g, '\\u003c')
writeFileSync(join(dir, 'progress.html'), template.replace('__DATA__', () => json))
console.log(`${data.title}: ${data.done}/${data.total} (${data.pct}%)`)
