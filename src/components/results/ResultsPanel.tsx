import { useState, useMemo } from 'react'
import { Download, Filter } from 'lucide-react'
import { SummaryBar } from './SummaryBar'
import { TestCard } from './TestCard'
import type { DStatus, GenerationResponse } from '../../types'

interface Props {
  response: GenerationResponse
}

type FilterOption = DStatus | 'ALL' | 'NO_VAL'

const FILTERS: { value: FilterOption; label: string }[] = [
  { value: 'ALL',    label: 'All' },
  { value: 'PASS',   label: 'PASS' },
  { value: 'FAIL',   label: 'FAIL' },
  { value: 'WARN',   label: 'WARN' },
  { value: 'NO_VAL', label: 'No Validation' },
]

export function ResultsPanel({ response }: Props) {
  const [filter, setFilter] = useState<FilterOption>('ALL')

  const filtered = useMemo(() => {
    if (filter === 'ALL') return response.tests
    if (filter === 'NO_VAL') return response.tests.filter(t => !t.validation)
    return response.tests.filter(t => t.validation?.dstatus === filter)
  }, [response.tests, filter])

  function exportJson() {
    const blob = new Blob([JSON.stringify(response, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `validra-results-${Date.now()}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-4">
      <SummaryBar response={response} />

      {/* Toolbar */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 flex-wrap">
          <Filter size={13} className="text-gray-500" />
          {FILTERS.map(f => (
            <button
              key={f.value}
              type="button"
              onClick={() => setFilter(f.value)}
              className={`px-2.5 py-1 rounded-full text-xs font-medium transition-colors ${
                filter === f.value
                  ? 'bg-sky-600 text-white'
                  : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
        <button
          type="button"
          onClick={exportJson}
          className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-gray-200 px-3 py-1.5 rounded-lg border border-gray-700 hover:border-gray-500 transition-colors"
        >
          <Download size={13} /> Export JSON
        </button>
      </div>

      {/* Test cards */}
      <div className="space-y-2">
        {filtered.length === 0 && (
          <p className="text-center py-8 text-gray-600 text-sm">No tests match this filter</p>
        )}
        {filtered.map(t => (
          <TestCard key={t.id} result={t} />
        ))}
      </div>
    </div>
  )
}
