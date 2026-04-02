import type { TestRequest, TestType, Provider } from '../../types'

const TEST_TYPES: { value: TestType; label: string; desc: string }[] = [
  { value: 'FUZZ', label: 'Fuzz', desc: 'Input validation edge cases' },
  { value: 'AUTH', label: 'Auth', desc: 'Authentication & authorization' },
  { value: 'PEN',  label: 'Pen',  desc: 'Penetration & injection probes' },
]

const PROVIDERS: { value: Provider; label: string }[] = [
  { value: 'ollama',    label: 'Ollama (local)' },
  { value: 'openai',   label: 'OpenAI' },
  { value: 'anthropic', label: 'Anthropic' },
]

interface Props {
  value: Pick<TestRequest, 'test_type' | 'max_cases' | 'validate' | 'provider'>
  onChange: (v: Partial<TestRequest>) => void
}

export function TestOptions({ value, onChange }: Props) {
  return (
    <div className="space-y-4">
      {/* Test type */}
      <div className="space-y-2">
        <h3 className="text-xs font-semibold uppercase tracking-widest text-gray-400">Test Type</h3>
        <div className="grid grid-cols-3 gap-2">
          {TEST_TYPES.map(t => (
            <button
              key={t.value}
              type="button"
              onClick={() => onChange({ test_type: t.value })}
              className={`rounded-lg border px-3 py-2 text-left transition-colors ${
                value.test_type === t.value
                  ? 'border-sky-500 bg-sky-950 text-sky-300'
                  : 'border-gray-700 bg-gray-800 text-gray-400 hover:border-gray-500'
              }`}
            >
              <p className="text-sm font-semibold">{t.label}</p>
              <p className="text-xs text-gray-500">{t.desc}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Max cases */}
      <div className="space-y-2">
        <div className="flex justify-between">
          <h3 className="text-xs font-semibold uppercase tracking-widest text-gray-400">Max Cases</h3>
          <span className="text-xs font-mono text-sky-300">{value.max_cases}</span>
        </div>
        <input
          type="range"
          min={3}
          max={100}
          step={1}
          value={value.max_cases}
          onChange={e => onChange({ max_cases: parseInt(e.target.value) })}
          className="w-full accent-sky-500"
        />
        <div className="flex justify-between text-xs text-gray-600">
          <span>3</span><span>100</span>
        </div>
      </div>

      {/* Validate */}
      <div className="space-y-1.5">
        <h3 className="text-xs font-semibold uppercase tracking-widest text-gray-400">Result Validation</h3>
        <label className={`flex items-center gap-3 rounded-lg border px-4 py-3 cursor-pointer select-none transition-colors ${
          value.validate
            ? 'border-sky-500 bg-sky-950 text-sky-300'
            : 'border-gray-700 bg-gray-800 text-gray-400 hover:border-gray-500'
        }`}>
          <input
            type="checkbox"
            checked={value.validate}
            onChange={e => onChange({ validate: e.target.checked })}
            className="w-4 h-4 rounded accent-sky-500 shrink-0"
          />
          <div>
            <p className="text-sm font-semibold">Validate test results with LLM</p>
            <p className="text-xs text-gray-500">Use the selected LLM to assess each response</p>
          </div>
        </label>
      </div>

      {/* Provider */}
      <div className="space-y-1.5">
        <h3 className="text-xs font-semibold uppercase tracking-widest text-gray-400">LLM Provider</h3>
        <select
          value={value.provider}
          onChange={e => onChange({ provider: e.target.value as Provider })}
          className="w-full rounded-lg bg-gray-800 border border-gray-700 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-sky-500"
        >
          {PROVIDERS.map(p => (
            <option key={p.value} value={p.value}>{p.label}</option>
          ))}
        </select>
      </div>
    </div>
  )
}
