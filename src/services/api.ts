import axios from 'axios'
import type { SSEEvent, TestRequest, ValidationResult } from '../types'

const BASE_URL = import.meta.env.VITE_API_URL || ''

const client = axios.create({ baseURL: BASE_URL, timeout: 300_000 })

export async function* generateAndRunStream(req: TestRequest): AsyncGenerator<SSEEvent> {
  const response = await fetch(`${BASE_URL}/generateAndRun`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(req),
  })

  if (!response.ok || !response.body) {
    const data = await response.json().catch(() => ({}))
    throw new Error((data as { detail?: string }).detail ?? `HTTP ${response.status}`)
  }

  const reader = response.body.getReader()
  const decoder = new TextDecoder()
  let buffer = ''

  while (true) {
    const { done, value } = await reader.read()
    if (done) break

    buffer += decoder.decode(value, { stream: true })
    const lines = buffer.split('\n')
    buffer = lines.pop() ?? ''

    for (const line of lines) {
      if (!line.startsWith('data: ')) continue
      const text = line.slice(6).trim()
      if (text) yield JSON.parse(text) as SSEEvent
    }
  }
}

export async function validateSingle(
  test: Record<string, unknown>,
  response: Record<string, unknown>,
  meta: Record<string, string>,
  provider: string,
): Promise<{ validation: ValidationResult }> {
  const { data } = await client.post('/validate', { test, response, meta, provider })
  return data
}
