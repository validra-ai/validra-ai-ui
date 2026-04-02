import { renderHook, act } from '@testing-library/react'
import { describe, it, expect, beforeEach } from 'vitest'
import { useHistory } from './useHistory'
import type { GenerationResponse, TestRequest } from '../types'

const mockRequest = (overrides: Partial<TestRequest> = {}): TestRequest => ({
  endpoint: 'https://api.example.com/users',
  method: 'POST',
  headers: {},
  payload: {},
  payload_meta: {},
  test_type: 'FUZZ',
  max_cases: 5,
  validate: true,
  provider: 'ollama',
  ...overrides,
})

const mockResponse = (): GenerationResponse => ({
  tests: [],
  summary: { total: 0, success: 0, failed: 0, total_duration_ms: 0 },
})

describe('useHistory', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('starts with empty history', () => {
    const { result } = renderHook(() => useHistory())
    expect(result.current.history).toHaveLength(0)
  })

  it('adds a run', () => {
    const { result } = renderHook(() => useHistory())
    act(() => { result.current.addRun(mockRequest(), mockResponse()) })
    expect(result.current.history).toHaveLength(1)
  })

  it('creates label from test type and endpoint path', () => {
    const { result } = renderHook(() => useHistory())
    act(() => { result.current.addRun(mockRequest(), mockResponse()) })
    expect(result.current.history[0].label).toBe('FUZZ → /users')
  })

  it('prepends new runs to the front', () => {
    const { result } = renderHook(() => useHistory())
    act(() => {
      result.current.addRun(mockRequest({ test_type: 'AUTH' }), mockResponse())
      result.current.addRun(mockRequest({ test_type: 'PEN' }), mockResponse())
    })
    expect(result.current.history[0].label).toMatch(/^PEN/)
  })

  it('removes a run by id', () => {
    const { result } = renderHook(() => useHistory())
    let id = ''
    act(() => { id = result.current.addRun(mockRequest(), mockResponse()).id })
    act(() => { result.current.removeRun(id) })
    expect(result.current.history).toHaveLength(0)
  })

  it('clears all runs', () => {
    const { result } = renderHook(() => useHistory())
    act(() => {
      result.current.addRun(mockRequest(), mockResponse())
      result.current.addRun(mockRequest(), mockResponse())
    })
    act(() => { result.current.clearHistory() })
    expect(result.current.history).toHaveLength(0)
  })

  it('persists runs to localStorage', () => {
    const { result } = renderHook(() => useHistory())
    act(() => { result.current.addRun(mockRequest(), mockResponse()) })
    const stored = JSON.parse(localStorage.getItem('validra_run_history') ?? '[]')
    expect(stored).toHaveLength(1)
  })

  it('loads existing runs from localStorage on mount', () => {
    const { result: r1 } = renderHook(() => useHistory())
    act(() => { r1.current.addRun(mockRequest(), mockResponse()) })

    const { result: r2 } = renderHook(() => useHistory())
    expect(r2.current.history).toHaveLength(1)
  })

  it('assigns a unique id to each run', () => {
    const { result } = renderHook(() => useHistory())
    act(() => {
      result.current.addRun(mockRequest(), mockResponse())
      result.current.addRun(mockRequest(), mockResponse())
    })
    const ids = result.current.history.map(r => r.id)
    expect(new Set(ids).size).toBe(2)
  })

  it('caps history at 50 runs', () => {
    const { result } = renderHook(() => useHistory())
    act(() => {
      for (let i = 0; i < 55; i++) {
        result.current.addRun(mockRequest(), mockResponse())
      }
    })
    expect(result.current.history).toHaveLength(50)
  })
})
