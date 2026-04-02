import { useState } from 'react'
import { ChevronDown, ChevronRight, Clock } from 'lucide-react'
import clsx from 'clsx'
import { StatusBadge } from './StatusBadge'
import type { TestResult } from '../../types'

interface Props {
  result: TestResult
}

export function TestCard({ result }: Props) {
  const [open, setOpen] = useState(false)
  const dstatus = result.validation?.dstatus

  const borderColor = dstatus === 'PASS'
    ? 'border-l-pass'
    : dstatus === 'FAIL'
    ? 'border-l-fail'
    : dstatus === 'WARN'
    ? 'border-l-warn'
    : 'border-l-gray-700'

  return (
    <div className={clsx('rounded-lg border border-gray-800 border-l-4 overflow-hidden', borderColor)}>
      {/* Header row */}
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center gap-3 px-4 py-3 bg-gray-900 hover:bg-gray-800/70 text-left transition-colors"
      >
        <span className="text-xs font-mono text-gray-500 w-12 shrink-0">{result.id}</span>

        <span className="flex-1 text-sm text-gray-200 truncate">
          {result.description || '—'}
        </span>

        <div className="flex items-center gap-3 shrink-0">
          {dstatus && <StatusBadge status={dstatus} size="sm" />}

          <span
            className={clsx(
              'text-xs font-mono px-1.5 py-0.5 rounded',
              result.success ? 'bg-sky-950 text-sky-300' : 'bg-red-950 text-red-300',
            )}
          >
            {result.response.status_code}
          </span>

          <span className="flex items-center gap-1 text-xs text-gray-600">
            <Clock size={11} />{result.duration_ms}ms
          </span>

          {open ? <ChevronDown size={14} className="text-gray-500" /> : <ChevronRight size={14} className="text-gray-500" />}
        </div>
      </button>

      {/* Expanded detail */}
      {open && (
        <div className="border-t border-gray-800 grid grid-cols-1 md:grid-cols-2 gap-0 divide-y md:divide-y-0 md:divide-x divide-gray-800">
          {/* Request */}
          <Section title="Request">
            <CodeBlock value={result.request} />
          </Section>

          {/* Response + Validation */}
          <div className="flex flex-col divide-y divide-gray-800">
            <Section title="Response">
              <CodeBlock value={result.response} />
            </Section>

            {result.validation && (
              <Section title="LLM Validation">
                <div className="flex items-start gap-3">
                  <StatusBadge status={result.validation.dstatus} />
                  <div className="flex-1 space-y-1">
                    <p className="text-xs text-gray-300">{result.validation.reason}</p>
                    <p className="text-xs text-gray-500">
                      Confidence: <span className="font-mono text-gray-300">
                        {(result.validation.confidence * 100).toFixed(0)}%
                      </span>
                    </p>
                  </div>
                </div>
              </Section>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="p-4 space-y-2 bg-gray-950/50">
      <p className="text-xs font-semibold uppercase tracking-widest text-gray-500">{title}</p>
      {children}
    </div>
  )
}

function CodeBlock({ value }: { value: unknown }) {
  return (
    <pre className="text-xs font-mono text-gray-300 bg-gray-900 rounded-lg p-3 overflow-auto max-h-60 whitespace-pre-wrap break-all">
      {JSON.stringify(value, null, 2)}
    </pre>
  )
}
