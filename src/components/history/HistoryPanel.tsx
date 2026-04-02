import { Trash2, Clock, RotateCcw } from 'lucide-react'
import type { SavedRun, TestRequest } from '../../types'

interface Props {
  history: SavedRun[]
  onLoad: (req: TestRequest) => void
  onRemove: (id: string) => void
  onClear: () => void
}

export function HistoryPanel({ history, onLoad, onRemove, onClear }: Props) {
  if (history.length === 0) {
    return (
      <div className="text-center py-10 text-gray-600 text-sm">
        No runs yet. Execute a test to see history here.
      </div>
    )
  }

  return (
    <div className="space-y-2">
      <div className="flex justify-end">
        <button
          type="button"
          onClick={onClear}
          className="text-xs text-gray-600 hover:text-red-400 flex items-center gap-1"
        >
          <Trash2 size={12} /> Clear all
        </button>
      </div>

      {history.map(run => {
        const pass = run.response.tests.filter(t => t.validation?.dstatus === 'PASS').length
        const fail = run.response.tests.filter(t => t.validation?.dstatus === 'FAIL').length
        const warn = run.response.tests.filter(t => t.validation?.dstatus === 'WARN').length

        return (
          <div
            key={run.id}
            className="rounded-lg border border-gray-800 bg-gray-900 p-3 flex items-center gap-3"
          >
            <div className="flex-1 min-w-0">
              <p className="text-sm font-mono text-gray-200 truncate">{run.label}</p>
              <div className="flex items-center gap-3 mt-1">
                <span className="flex items-center gap-1 text-xs text-gray-600">
                  <Clock size={11} />
                  {new Date(run.timestamp).toLocaleString()}
                </span>
                <span className="text-xs text-gray-600">|</span>
                {pass > 0 && <span className="text-xs text-pass-text font-bold">{pass} P</span>}
                {fail > 0 && <span className="text-xs text-fail-text font-bold">{fail} F</span>}
                {warn > 0 && <span className="text-xs text-warn-text font-bold">{warn} W</span>}
              </div>
            </div>
            <button
              type="button"
              title="Reload config"
              onClick={() => onLoad(run.request)}
              className="text-gray-600 hover:text-sky-400 p-1"
            >
              <RotateCcw size={15} />
            </button>
            <button
              type="button"
              title="Delete"
              onClick={() => onRemove(run.id)}
              className="text-gray-600 hover:text-red-400 p-1"
            >
              <Trash2 size={15} />
            </button>
          </div>
        )
      })}
    </div>
  )
}
