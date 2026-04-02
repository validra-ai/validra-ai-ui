import { Plus, Trash2, HelpCircle, Wand2 } from 'lucide-react'
import { useRef, useEffect } from 'react'

interface Props {
  value: Record<string, string>
  onChange: (v: Record<string, string>) => void
  payload?: Record<string, unknown>
}

function inferConstraint(val: unknown): string {
  if (typeof val === 'number') return 'required, numeric [1-999]'
  if (typeof val === 'boolean') return 'required, boolean'
  if (typeof val === 'string') {
    if (/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(val)) return 'required, valid email format'
    if (/^https?:\/\//.test(val)) return 'required, valid URL'
    return 'required, alphanumeric [3-20]'
  }
  if (Array.isArray(val)) return 'required, array'
  if (val !== null && typeof val === 'object') return 'required, object'
  return 'required'
}

const EXAMPLES = [
  'required, alphanumeric [3-20]',
  'required, numeric [0-60]',
  'required, valid email format',
]

export function MetaEditor({ value, onChange, payload }: Props) {
  const entries = Object.entries(value)
  const lastKeyInputRef = useRef<HTMLInputElement>(null)
  const prevLengthRef = useRef(entries.length)

  useEffect(() => {
    if (entries.length > prevLengthRef.current && lastKeyInputRef.current) {
      setTimeout(() => lastKeyInputRef.current?.focus(), 0)
    }
    prevLengthRef.current = entries.length
  }, [entries.length])

  function update(idx: number, key: string, constraint: string) {
    const next = [...entries]
    next[idx] = [key, constraint]
    onChange(Object.fromEntries(next.filter(([k]) => k !== '')))
  }

  function remove(idx: number) {
    const next = entries.filter((_, i) => i !== idx)
    onChange(Object.fromEntries(next))
  }

  function add() {
    onChange({ ...value, '': '' })
  }

  function generate() {
    if (!payload) return
    const generated = Object.fromEntries(
      Object.entries(payload).map(([k, v]) => [k, inferConstraint(v)])
    )
    onChange(generated)
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <h3 className="text-xs font-semibold uppercase tracking-widest text-gray-400">Payload Meta</h3>
          <div className="group relative">
            <HelpCircle size={12} className="text-gray-600 cursor-help" />
            <div className="absolute left-0 bottom-5 z-10 hidden group-hover:block w-72 rounded-lg bg-gray-700 border border-gray-600 p-3 text-xs text-gray-300 shadow-xl">
              <p className="font-semibold mb-1">Field constraints for LLM test generation.</p>
              <p className="text-gray-400 mb-2">Examples:</p>
              {EXAMPLES.map(ex => (
                <p key={ex} className="font-mono text-sky-300">"{ex}"</p>
              ))}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {payload && (
            <button
              type="button"
              onClick={generate}
              className="flex items-center gap-1 text-xs text-violet-400 hover:text-violet-300"
            >
              <Wand2 size={12} /> Generate from JSON
            </button>
          )}
          <button
            type="button"
            onClick={add}
            className="flex items-center gap-1 text-xs text-sky-400 hover:text-sky-300"
          >
            <Plus size={12} /> Add field
          </button>
        </div>
      </div>

      {entries.length === 0 && (
        <p className="text-xs text-gray-600 italic">No meta — the LLM will infer constraints from the payload</p>
      )}

      {entries.map(([k, v], idx) => {
        const isLast = idx === entries.length - 1
        return (
          <div key={idx} className="flex gap-2 items-center">
            <input
              ref={isLast ? lastKeyInputRef : null}
              placeholder="fieldName"
              value={k}
              onChange={e => update(idx, e.target.value, v)}
              className="w-2/5 rounded-lg bg-gray-800 border border-gray-700 px-2 py-1.5 text-xs font-mono placeholder-gray-600 focus:outline-none focus:ring-1 focus:ring-sky-500"
            />
            <input
              placeholder="required, alphanumeric, [3-20] chars"
              value={v}
              onChange={e => update(idx, k, e.target.value)}
              className="flex-1 rounded-lg bg-gray-800 border border-gray-700 px-2 py-1.5 text-xs font-mono placeholder-gray-600 focus:outline-none focus:ring-1 focus:ring-sky-500"
            />
            <button type="button" onClick={() => remove(idx)} className="text-gray-600 hover:text-red-400">
              <Trash2 size={14} />
            </button>
          </div>
        )
      })}
    </div>
  )
}
