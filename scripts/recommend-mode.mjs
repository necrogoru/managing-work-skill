// Asks Jev (TypeSafe's System One model) which mode fits a work request,
// or with --review, whether proposed self-review edits fit the skill's bar.

import { existsSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const API_URL = 'https://api.typesafe.ai/v1/systemone'
const ENV_FILE = join(dirname(fileURLToPath(import.meta.url)), '..', '.env')

function fail(message) {
  console.error(message)
  process.exit(1)
}

const THRESHOLD = 0.7

async function askJev(key, body) {
  let response
  try {
    response = await fetch(API_URL, {
      method: 'POST',
      headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(15000),
    })
  } catch (error) {
    fail(`Jev request failed: ${error.message}`)
  }
  if (!response.ok) fail(`Jev returned ${response.status}: ${await response.text()}`)
  return response.json()
}

if (existsSync(ENV_FILE)) process.loadEnvFile(ENV_FILE)
const key = process.env.TYPESAFE_API_KEY
if (!key) fail(`TYPESAFE_API_KEY is not set in the environment or in ${ENV_FILE}`)

const args = process.argv.slice(2)

if (args[0] === '--review') {
  const edits = args.slice(1).map((s) => s.trim()).filter(Boolean)
  if (edits.length === 0) {
    fail('Usage: node recommend-mode.mjs --review "<edit 1>" ["<edit 2>" ...]')
  }

  const results = await Promise.all(
    edits.map(async (edit) => {
      const data = await askJev(key, {
        state: edit,
        model: 'jev-latest',
        questions: {
          workflow: {
            type: 'noul',
            instructions:
              'Does this proposed edit directly help plan, run, or verify work in stages or toward a goal?',
            criteria: {
              true: 'It improves stages or goal execution, clarity, or verification across projects.',
              false: 'It is project-specific, off-topic, or unrelated to stages or goal execution.',
            },
          },
          simple_fast: {
            type: 'noul',
            instructions: 'Does this proposed edit keep the skill simple and fast to execute?',
            criteria: {
              true: 'It is concise and avoids extra steps, ceremony, or slowdowns.',
              false: 'It adds heavy ceremony, extra gates, or slows down execution.',
            },
          },
          effective_lean: {
            type: 'noul',
            instructions:
              'Does this proposed edit help produce working implementations without adding over-engineering?',
            criteria: {
              true: 'It drives toward a correct, minimal implementation and avoids unnecessary layers or rules.',
              false: 'It introduces excessive rules, edge-case bureaucracy, or unnecessary complexity.',
            },
          },
        },
      })
      const a = data.answers
      const w = a?.workflow?.noul
      const s = a?.simple_fast?.noul
      const l = a?.effective_lean?.noul
      if (typeof w !== 'number' || typeof s !== 'number' || typeof l !== 'number') {
        fail('Jev response is missing noul scores for "--review"')
      }
      const verdict = w >= THRESHOLD && s >= THRESHOLD && l >= THRESHOLD ? 'keep' : 'drop'
      return { verdict, w, s, l }
    }),
  )

  for (const [i, { verdict, w, s, l }] of results.entries()) {
    console.log(
      `${i + 1}: ${verdict} (workflow ${w.toFixed(2)}, simple ${s.toFixed(2)}, lean ${l.toFixed(2)})`,
    )
  }
  process.exit(0)
}

const request = args.join(' ').trim()
if (!request) fail('Usage: node recommend-mode.mjs "<the user\'s request>"')

const body = {
  state: request,
  model: 'jev-latest',
  questions: {
    mode: {
      type: 'choice',
      instructions: 'How should this software work request be organized?',
      criteria: {
        stages:
          'A concrete deliverable is known (add, build, migrate X to Y) and the work can be split up front into tasks to check off.',
        goal: 'A measurable outcome is wanted but the path is unknown (hit a target, make something pass, find out why something fails), so the work iterates until verifiable criteria hold.',
      },
    },
  },
}

const data = await askJev(key, body)
const answer = data.answers?.mode
if (!answer?.choice) fail('Jev response has no answer for "mode"')
console.log(`${answer.choice} ${answer.confidence.toFixed(2)}`)
