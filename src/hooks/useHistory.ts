import { useState, useEffect } from 'react'
import type { GenerationResponse, SavedRun, TestRequest } from '../types'

const STORAGE_KEY = 'validra_run_history'
const MAX_RUNS = 50

function load(): SavedRun[] {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]')
  } catch {
    return []
  }
}

function save(runs: SavedRun[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(runs))
}

export function useHistory() {
  const [history, setHistory] = useState<SavedRun[]>(load)

  useEffect(() => { save(history) }, [history])

  function addRun(request: TestRequest, response: GenerationResponse): SavedRun {
    const run: SavedRun = {
      id: crypto.randomUUID(),
      label: `${request.test_type} → ${new URL(request.endpoint).pathname}`,
      timestamp: Date.now(),
      request,
      response,
    }
    setHistory(prev => [run, ...prev].slice(0, MAX_RUNS))
    return run
  }

  function removeRun(id: string) {
    setHistory(prev => prev.filter(r => r.id !== id))
  }

  function clearHistory() {
    setHistory([])
  }

  return { history, addRun, removeRun, clearHistory }
}
