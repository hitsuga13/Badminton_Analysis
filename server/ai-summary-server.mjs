import { createServer } from 'node:http'
import { readFileSync, existsSync } from 'node:fs'

loadEnvFile()

const port = Number(process.env.AI_SUMMARY_PORT ?? 8787)
const apiKey = process.env.OPENAI_API_KEY
const model = process.env.OPENAI_MODEL ?? 'gpt-5.6-luna'

createServer(async (request, response) => {
  response.setHeader('Access-Control-Allow-Origin', '*')
  response.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  response.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  if (request.method === 'OPTIONS') return response.writeHead(204).end()
  if (request.method !== 'POST' || request.url !== '/api/ai-summary') {
    return sendJson(response, 404, { error: 'Not found' })
  }
  if (!apiKey) return sendJson(response, 503, { error: 'OPENAI_API_KEY is not configured.' })

  try {
    const report = await readJson(request)
    const result = await createSummary(report)
    return sendJson(response, 200, { summary: result })
  } catch (error) {
    return sendJson(response, 500, { error: error.message || 'Unable to generate AI summary.' })
  }
}).listen(port, () => console.log(`AI summary server listening on http://localhost:${port}`))

async function createSummary(report) {
  const prompt = `You are a badminton coach. Write a concise coaching summary in Bahasa Melayu based ONLY on the supplied match data. Do not invent shots, scores, trends, or causes that are not present. Include: one match overview, 2 strengths/observations, and up to 2 practical training focuses. Use clear headings and short bullet points.\n\nMATCH DATA:\n${JSON.stringify(report)}`
  const apiResponse = await fetch('https://api.openai.com/v1/responses', {
    method: 'POST',
    headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ model, input: prompt, max_output_tokens: 450 }),
  })
  const payload = await apiResponse.json()
  if (!apiResponse.ok) throw new Error(payload?.error?.message ?? 'OpenAI request failed.')
  const text = payload.output
    ?.flatMap((item) => item.content ?? [])
    .find((item) => item.type === 'output_text')?.text
  if (!text) throw new Error('The AI service returned no summary.')
  return text
}

function readJson(request) {
  return new Promise((resolve, reject) => {
    let body = ''
    request.on('data', (chunk) => {
      body += chunk
    })
    request.on('end', () => {
      try {
        resolve(JSON.parse(body || '{}'))
      } catch {
        reject(new Error('Invalid match report.'))
      }
    })
    request.on('error', reject)
  })
}

function sendJson(response, status, data) {
  response.writeHead(status, { 'Content-Type': 'application/json' })
  response.end(JSON.stringify(data))
}

function loadEnvFile() {
  if (!existsSync('.env')) return
  readFileSync('.env', 'utf8')
    .split(/\r?\n/)
    .forEach((line) => {
      const match = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/)
      if (match && !process.env[match[1]])
        process.env[match[1]] = match[2].replace(/^['"]|['"]$/g, '')
    })
}
