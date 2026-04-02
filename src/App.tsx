import { useState } from 'react'
import { Play, History, AlertCircle, Loader2, ShieldCheck } from 'lucide-react'
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
  validate: true,
  provider: 'ollama',
}

type Tab = 'run' | 'history'

export default function App() {
  const [req, setReq] = useState<TestRequest>(DEFAULT_REQUEST)
  const [tab, setTab] = useState<Tab>('run')
  const { loading, response, error, run } = useTestRun()
  const { history, addRun, removeRun, clearHistory } = useHistory()

  function patch(partial: Partial<TestRequest>) {
    setReq(prev => ({ ...prev, ...partial }))
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
            <Play size={13} /> Run
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

            <button
              type="button"
              onClick={handleRun}
              disabled={!canRun}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-sm transition-colors bg-sky-600 hover:bg-sky-500 disabled:bg-gray-800 disabled:text-gray-600 disabled:cursor-not-allowed"
            >
              {loading
                ? <><Loader2 size={16} className="animate-spin" /> Running…</>
                : <><Play size={16} /> Run Tests</>
              }
            </button>
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
                <div className="flex flex-col items-center justify-center h-64 gap-4 text-gray-500">
                  <Loader2 size={36} className="animate-spin text-sky-500" />
                  <p className="text-sm">Generating and running tests…</p>
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

              {response && !loading && (
                <ResultsPanel response={response} />
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
