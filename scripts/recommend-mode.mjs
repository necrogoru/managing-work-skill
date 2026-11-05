// Asks Jev (TypeSafe's System One model) which mode fits a work request.
// Prints "<mode> <confidence>", e.g. "goal 0.94". Exits non-zero when it can't answer.

import { existsSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const API_URL = 'https://api.typesafe.ai/v1/systemone'
const ENV_FILE = join(dirname(fileURLToPath(import.meta.url)), '..', '.env')

function fail(message) {
  console.error(message)
  process.exit(1)
}

if (existsSync(ENV_FILE)) process.loadEnvFile(ENV_FILE)
const key = process.env.TYPESAFE_API_KEY
if (!key) fail(`TYPESAFE_API_KEY is not set in the environment or in ${ENV_FILE}`)

const request = process.argv.slice(2).join(' ').trim()
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

const answer = (await response.json()).answers?.mode
if (!answer?.choice) fail('Jev response has no answer for "mode"')
console.log(`${answer.choice} ${answer.confidence.toFixed(2)}`)
