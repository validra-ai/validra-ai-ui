import { useState } from 'react'
import { cancelRun, generateAndRunStream } from '../services/api'
import type { GenerationResponse, ProgressState, TestRequest, TestResult } from '../types'

export interface RunState {
  loading: boolean
  progress: ProgressState | null
  streamedResults: TestResult[]
  response: GenerationResponse | null
  error: string | null
  runId: string | null
  canceled: boolean
}

export function useTestRun() {
  const [state, setState] = useState<RunState>({
    loading: false,
    progress: null,
    streamedResults: [],
    response: null,
    error: null,
    runId: null,
    canceled: false,
  })

  async function run(req: TestRequest): Promise<GenerationResponse | null> {
    setState({
      loading: true,
      progress: null,
      streamedResults: [],
      response: null,
      error: null,
      runId: null,
      canceled: false,
    })

    const accumulated: TestResult[] = []
    let completedCount = 0
    let finalResponse: GenerationResponse | null = null

    try {
      for await (const event of generateAndRunStream(req)) {
        if (event.phase === 'warming_up') {
          setState((prev: RunState) => ({
            ...prev,
            progress: { phase: 'warming_up', current: 0, total: 0, completed: 0 },
            runId: event.run_id ?? prev.runId,
            canceled: false,
          }))
        } else if (event.phase === 'generating') {
          setState((prev: RunState) => ({
            ...prev,
            progress: { phase: 'generating', current: 0, total: 0, completed: 0 },
          }))
        } else if (event.phase === 'executing') {
          setState((prev: RunState) => ({
            ...prev,
            progress: { phase: 'executing', current: event.progress!, total: event.total!, completed: completedCount },
          }))
        } else if (event.phase === 'validating') {
          setState((prev: RunState) => ({
            ...prev,
            progress: { phase: 'validating', current: event.progress!, total: event.total!, completed: completedCount },
          }))
        } else if (event.phase === 'result') {
          completedCount++
          accumulated.push(event.result!)
          setState((prev: RunState) => ({
            ...prev,
            progress: prev.progress ? { ...prev.progress, completed: completedCount } : null,
            streamedResults: [...accumulated],
          }))
        } else if (event.phase === 'cancelled') {
          const successCount = accumulated.filter(r => r.success).length
          const totalDuration = accumulated.reduce((sum, r) => sum + r.duration_ms, 0)
          finalResponse = {
            tests: accumulated,
            summary: {
              total: accumulated.length,
              success: successCount,
              failed: accumulated.length - successCount,
              total_duration_ms: totalDuration,
            },
          }
          setState({
            loading: false,
            progress: null,
            streamedResults: accumulated,
            response: finalResponse,
            error: null,
            runId: null,
            canceled: true,
          })
          return finalResponse
        } else if (event.phase === 'done') {
          finalResponse = { tests: accumulated, summary: event.summary! }
          setState({
            loading: false,
            progress: null,
            streamedResults: accumulated,
            response: finalResponse,
            error: null,
            runId: null,
            canceled: false,
          })
        } else if (event.phase === 'error') {
          setState((prev: RunState) => ({
            ...prev,
            loading: false,
            progress: null,
            error: event.message ?? 'Unknown error',
          }))
          return null
        }
      }
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Unexpected error. Is validra-ai-core running?'
      setState((prev: RunState) => ({ ...prev, loading: false, progress: null, error: message }))
      return null
    }

    return finalResponse
  }

  async function cancel(): Promise<void> {
    if (!state.runId) return

    try {
      await cancelRun(state.runId)
      setState((prev: RunState) => ({ ...prev, canceled: true }))
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Could not cancel run'
      setState((prev: RunState) => ({ ...prev, error: message }))
    }
  }

  return { ...state, run, cancel }
}
