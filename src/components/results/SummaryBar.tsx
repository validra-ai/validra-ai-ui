import { CheckCircle2, XCircle, AlertTriangle, Clock, Layers } from 'lucide-react'
import type { GenerationResponse, TestResult } from '../../types'

interface Props {
  response: GenerationResponse
}

function count(tests: TestResult[], dstatus: string) {
  return tests.filter(t => t.validation?.dstatus === dstatus).length
}

export function SummaryBar({ response }: Props) {
  const { summary, tests } = response
  const pass = count(tests, 'PASS')
  const fail = count(tests, 'FAIL')
  const warn = count(tests, 'WARN')
  const noValidation = tests.filter(t => !t.validation).length

  return (
    <div className="rounded-xl border border-gray-800 bg-gray-900 p-4">
      <div className="flex flex-wrap gap-6 items-center">
        {/* Validation counts */}
        {pass > 0 && (
          <Stat icon={<CheckCircle2 size={16} className="text-pass" />} value={pass} label="PASS" color="text-pass-text" />
        )}
        {fail > 0 && (
          <Stat icon={<XCircle size={16} className="text-fail" />} value={fail} label="FAIL" color="text-fail-text" />
        )}
        {warn > 0 && (
          <Stat icon={<AlertTriangle size={16} className="text-warn" />} value={warn} label="WARN" color="text-warn-text" />
        )}
        {noValidation > 0 && (
          <Stat icon={<Layers size={16} className="text-gray-500" />} value={noValidation} label="No Val." color="text-gray-400" />
        )}

        <div className="h-6 w-px bg-gray-700 mx-1 hidden sm:block" />

        {/* HTTP stats */}
        <Stat icon={<CheckCircle2 size={16} className="text-sky-400" />} value={summary.success} label="HTTP 2xx" color="text-gray-300" />
        <Stat icon={<XCircle size={16} className="text-gray-500" />} value={summary.failed} label="Non-2xx" color="text-gray-300" />
        <Stat icon={<Layers size={16} className="text-gray-500" />} value={summary.total} label="Total" color="text-gray-300" />
        <Stat
          icon={<Clock size={16} className="text-gray-500" />}
          value={`${(summary.total_duration_ms / 1000).toFixed(1)}s`}
          label="Duration"
          color="text-gray-300"
        />
      </div>

      {/* Progress bar */}
      {(pass + fail + warn) > 0 && (
        <div className="mt-3 flex h-2 rounded-full overflow-hidden gap-px">
          {pass > 0  && <div className="bg-pass"  style={{ flex: pass }} />}
          {warn > 0  && <div className="bg-warn"  style={{ flex: warn }} />}
          {fail > 0  && <div className="bg-fail"  style={{ flex: fail }} />}
          {noValidation > 0 && <div className="bg-gray-700" style={{ flex: noValidation }} />}
        </div>
      )}
    </div>
  )
}

function Stat({
  icon, value, label, color,
}: {
  icon: React.ReactNode
  value: number | string
  label: string
  color: string
}) {
  return (
    <div className="flex items-center gap-1.5">
      {icon}
      <span className={`text-sm font-bold ${color}`}>{value}</span>
      <span className="text-xs text-gray-500">{label}</span>
    </div>
  )
}
