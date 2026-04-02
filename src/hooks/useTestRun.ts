import { useState } from 'react'
import { generateAndRun } from '../services/api'
import type { GenerationResponse, TestRequest } from '../types'

export interface RunState {
  loading: boolean
  response: GenerationResponse | null
  error: string | null
}

export function useTestRun() {
  const [state, setState] = useState<RunState>({ loading: false, response: null, error: null })

  async function run(req: TestRequest) {
    setState({ loading: true, response: null, error: null })
    try {
      const response = await generateAndRun(req)
      setState({ loading: false, response, error: null })
      return response
    } catch (err: unknown) {
      const axiosDetail =
        err != null &&
        typeof err === 'object' &&
        'response' in err &&
        err.response != null &&
        typeof err.response === 'object' &&
        'data' in err.response &&
        err.response.data != null &&
        typeof err.response.data === 'object' &&
        'detail' in err.response.data
          ? String((err.response.data as { detail: unknown }).detail)
          : null
      const message =
        axiosDetail ?? (err instanceof Error ? err.message : 'Unexpected error. Is validra-ai-core running?')
      setState({ loading: false, response: null, error: message })
      return null
    }
  }

  return { ...state, run }
}
