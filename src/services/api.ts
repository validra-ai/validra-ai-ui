import axios from 'axios'
import type { GenerationResponse, TestRequest, ValidationResult } from '../types'

const BASE_URL = import.meta.env.VITE_API_URL || ''

const client = axios.create({ baseURL: BASE_URL, timeout: 300_000 })

export async function generateAndRun(req: TestRequest): Promise<GenerationResponse> {
  const { data } = await client.post<GenerationResponse>('/generateAndRun', req)
  return data
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
