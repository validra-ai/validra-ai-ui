import { useState, useEffect } from 'react'
import { Play, History, AlertCircle, Loader2, ShieldCheck, Flame, Brain, Zap } from 'lucide-react'
import type { ProgressState, Summary, TestResult } from './types'

function RunProgress({ progress }: { progress: ProgressState | null }) {
  if (!progress) {
    return (
      <div className="flex items-center gap-3 px-4 py-3 rounded-xl border border-gray-800 bg-gray-900 text-sm text-gray-400">
        <Loader2 size={16} className="animate-spin text-sky-500 shrink-0" />
        Starting…
      </div>
    )
  }

  if (progress.phase === 'warming_up') {
    return (
      <div className="flex items-center gap-3 px-4 py-3 rounded-xl border border-amber-900/40 bg-amber-950/20 text-sm text-amber-400">
        <span className="flex gap-0.5">
          <Flame size={16} className="animate-bounce" style={{ animationDelay: '0ms' }} />
          <Flame size={14} className="animate-bounce text-amber-500/60" style={{ animationDelay: '120ms' }} />
          <Zap size={13} className="animate-bounce text-amber-300" style={{ animationDelay: '60ms' }} />
        </span>
        Warming up engines…
      </div>
    )
  }

  if (progress.phase === 'generating') {
    return (
      <div className="flex items-center gap-3 px-4 py-3 rounded-xl border border-sky-900/40 bg-sky-950/20 text-sm text-sky-400">
        <Brain size={16} className="animate-pulse shrink-0" />
        Generating test cases…
      </div>
    )
  }

  // executing — show progress bar
  // Use `current` (not `completed`) because results arrive only after all
  // parallel validations finish; `current` advances with each executing event.
  const pct = progress.total > 0 ? (progress.current / progress.total) * 100 : 0

  return (
    <div className="px-4 py-3 rounded-xl border border-gray-800 bg-gray-900 space-y-2">
      <div className="flex items-center justify-between text-sm">
        <span className="flex items-center gap-2 text-sky-400">
          <Zap size={14} className="animate-pulse" />
          Executing test {progress.current} of {progress.total}…
        </span>
        <span className="text-gray-600 text-xs tabular-nums">
          {progress.current}/{progress.total}
        </span>
      </div>
      <div className="h-1.5 bg-gray-800 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-500 bg-sky-500"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  )
}
import { EndpointConfig } from './components/config/EndpointConfig'
import { HeadersEditor } from './components/config/HeadersEditor'
import { JsonEditor } from './components/config/JsonEditor'
import { MetaEditor } from './components/config/MetaEditor'
import { TestOptions } from './components/config/TestOptions'
import { ProviderConfigPanel } from './components/config/ProviderConfig'
import { ResultsPanel } from './components/results/ResultsPanel'
import { HistoryPanel } from './components/history/HistoryPanel'
import { useTestRun } from './hooks/useTestRun'
import { useHistory } from './hooks/useHistory'
import type { TestRequest } from './types'

const DEFAULT_REQUEST: TestRequest = {
  endpoint: '',
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  payload: { username: 'john', age: 25, email: 'john@example.com' },
  payload_meta: {
    username: 'required, alphanumeric, [3-20] chars',
    age: 'required, numeric, [0-120]',
    email: 'required, valid email format',
  },
  test_type: 'FUZZ',
  max_cases: 10,
  run_validation: true,
  provider: 'ollama',
}

const REQUEST_STORAGE_KEY = 'validra_current_request'

type Tab = 'run' | 'history'

export default function App() {
  const [req, setReq] = useState<TestRequest>(() => {
    try {
      const raw = localStorage.getItem(REQUEST_STORAGE_KEY)
      if (raw) {
        const stored = JSON.parse(raw)
        // Merge with DEFAULT_REQUEST so that: (a) unknown stale keys are dropped,
        // (b) any newly added fields get a sensible default.
        return {
          ...DEFAULT_REQUEST,
          ...Object.fromEntries(
            Object.keys(DEFAULT_REQUEST).map(k => [k, stored[k] ?? DEFAULT_REQUEST[k as keyof TestRequest]])
          ),
        } as TestRequest
      }
    } catch {
      // ignore invalid stored data
    }
    return DEFAULT_REQUEST
  })
  const [tab, setTab] = useState<Tab>('run')
  const { loading, progress, streamedResults, response, error, run, cancel } = useTestRun()
  const { history, addRun, removeRun, clearHistory } = useHistory()

  useEffect(() => {
    localStorage.setItem(REQUEST_STORAGE_KEY, JSON.stringify(req))
  }, [req])

  function patch(partial: Partial<TestRequest>) {
    setReq(prev => {
      const next = { ...prev, ...partial }
      // Provider-specific config fields (e.g. Ollama's `url`) are invalid on
      // other providers whose configs use `extra = "forbid"`. Clear the override
      // whenever the provider itself changes to avoid 422 errors.
      if (partial.provider && partial.provider !== prev.provider) {
        next.provider_config = undefined
      }
      return next
    })
  }

  async function handleRun() {
    if (!req.endpoint) return
    const result = await run(req)
    if (result) {
      addRun(req, result)
      setTab('run')
    }
  }

  const canRun = req.endpoint.trim() !== '' && !loading

  return (
    <div className="h-screen bg-gray-950 flex flex-col">
      {/* Top bar */}
      <header className="border-b border-gray-800 px-6 py-3 flex items-center gap-3">
        <ShieldCheck size={22} className="text-sky-400" />
        <span className="font-bold text-lg tracking-tight text-white">Validra AI</span>
        <span className="text-gray-600 text-sm hidden sm:inline">Test Studio</span>

        <div className="ml-auto flex items-center gap-2">
          <TabBtn active={tab === 'run'} onClick={() => setTab('run')}>
            <Play size={13} /> Execution
          </TabBtn>
          <TabBtn active={tab === 'history'} onClick={() => setTab('history')}>
            <History size={13} />
            History
            {history.length > 0 && (
              <span className="ml-1 bg-gray-700 text-gray-300 text-xs rounded-full px-1.5">
                {history.length}
              </span>
            )}
          </TabBtn>
        </div>
      </header>

      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        {/* LEFT — config panel */}
        <aside className="w-full lg:w-[420px] xl:w-[480px] border-b lg:border-b-0 lg:border-r border-gray-800 overflow-y-auto">
          <div className="p-5 space-y-6">
            <EndpointConfig value={req} onChange={patch} />
            <Divider />
            <HeadersEditor value={req.headers} onChange={headers => patch({ headers })} />
            <Divider />
            <JsonEditor
              label="Payload"
              hint="JSON object"
              value={req.payload}
              onChange={payload => patch({ payload })}
            />
            <Divider />
            <MetaEditor value={req.payload_meta} onChange={payload_meta => patch({ payload_meta })} payload={req.payload} />
            <Divider />
            <TestOptions value={req} onChange={patch} />
            <Divider />
            <ProviderConfigPanel
              provider={req.provider}
              value={req.provider_config}
              onChange={provider_config => patch({ provider_config })}
            />

            {!loading ? (
              <button
                type="button"
                onClick={handleRun}
                disabled={!canRun}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-sm transition-colors bg-sky-600 hover:bg-sky-500 disabled:bg-gray-800 disabled:text-gray-600 disabled:cursor-not-allowed"
              >
                <><Play size={16} /> Run Tests</>
              </button>
            ) : (
              <button
                type="button"
                onClick={cancel}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-sm transition-colors bg-red-600 hover:bg-red-500"
              >
                <><Loader2 size={16} className="animate-spin" /> Cancel Run</>
              </button>
            )}
          </div>
        </aside>

        {/* RIGHT — results / history */}
        <main className="flex-1 overflow-y-auto p-5">
          {tab === 'history' && (
            <HistoryPanel
              history={history}
              onLoad={r => { setReq(r); setTab('run') }}
              onRemove={removeRun}
              onClear={clearHistory}
            />
          )}

          {tab === 'run' && (
            <>
              {loading && (
                <div className="mb-5">
                  <RunProgress progress={progress} />
                </div>
              )}

              {error && !loading && (
                <div className="rounded-xl border border-red-800 bg-red-950/30 p-5 flex gap-3">
                  <AlertCircle size={18} className="text-red-400 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-red-300 text-sm">Request failed</p>
                    <p className="text-xs text-red-400 mt-1">{error}</p>
                  </div>
                </div>
              )}

              {(response || (loading && streamedResults.length > 0)) && (
                <ResultsPanel
                  response={response ?? { tests: streamedResults, summary: buildRunningSummary(streamedResults) }}
                />
              )}

              {!response && !loading && !error && (
                <Empty />
              )}
            </>
          )}
        </main>
      </div>
    </div>
  )
}

function buildRunningSummary(results: TestResult[]): Summary {
  const success = results.filter(r => r.success).length
  return {
    total: results.length,
    success,
    failed: results.length - success,
    total_duration_ms: results.reduce((sum, r) => sum + r.duration_ms, 0),
  }
}

function Divider() {
  return <hr className="border-gray-800" />
}

function TabBtn({
  active,
  onClick,
  children,
}: {
  active: boolean
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
        active ? 'bg-gray-800 text-white' : 'text-gray-400 hover:text-gray-200'
      }`}
    >
      {children}
    </button>
  )
}

function Empty() {
  return (
    <div className="flex flex-col items-center justify-center h-64 gap-3 text-gray-600">
      <ShieldCheck size={48} className="text-gray-800" />
      <p className="text-sm">Configure a test on the left and click <strong className="text-gray-500">Run Tests</strong></p>
    </div>
  )
}
