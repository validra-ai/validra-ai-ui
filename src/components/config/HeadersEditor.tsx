import { Plus, Trash2 } from 'lucide-react'

interface Props {
  value: Record<string, string>
  onChange: (v: Record<string, string>) => void
}

export function HeadersEditor({ value, onChange }: Props) {
  const entries = Object.entries(value)

  function update(idx: number, key: string, val: string) {
    const next = [...entries]
    next[idx] = [key, val]
    onChange(Object.fromEntries(next.filter(([k]) => k !== '')))
  }

  function remove(idx: number) {
    const next = entries.filter((_, i) => i !== idx)
    onChange(Object.fromEntries(next))
  }

  function add() {
    onChange({ ...value, '': '' })
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-semibold uppercase tracking-widest text-gray-400">Headers</h3>
        <button
          type="button"
          onClick={add}
          className="flex items-center gap-1 text-xs text-sky-400 hover:text-sky-300"
        >
          <Plus size={12} /> Add
        </button>
      </div>

      {entries.length === 0 && (
        <p className="text-xs text-gray-600 italic">No headers — click Add to insert one</p>
      )}

      {entries.map(([k, v], idx) => (
        <div key={idx} className="flex gap-2 items-center">
          <input
            placeholder="Header-Name"
            value={k}
            onChange={e => update(idx, e.target.value, v)}
            className="w-2/5 rounded-lg bg-gray-800 border border-gray-700 px-2 py-1.5 text-xs font-mono placeholder-gray-600 focus:outline-none focus:ring-1 focus:ring-sky-500"
          />
          <input
            placeholder="value"
            value={v}
            onChange={e => update(idx, k, e.target.value)}
            className="flex-1 rounded-lg bg-gray-800 border border-gray-700 px-2 py-1.5 text-xs font-mono placeholder-gray-600 focus:outline-none focus:ring-1 focus:ring-sky-500"
          />
          <button type="button" onClick={() => remove(idx)} className="text-gray-600 hover:text-red-400">
            <Trash2 size={14} />
          </button>
        </div>
      ))}
    </div>
  )
}
