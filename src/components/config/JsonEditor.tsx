import { useState, useEffect } from 'react'
import { AlertCircle } from 'lucide-react'

interface Props {
  label: string
  hint?: string
  value: Record<string, unknown>
  onChange: (v: Record<string, unknown>) => void
  rows?: number
}

export function JsonEditor({ label, hint, value, onChange, rows = 6 }: Props) {
  const [raw, setRaw] = useState(() => JSON.stringify(value, null, 2))
  const [error, setError] = useState<string | null>(null)
  const [isFocused, setIsFocused] = useState(false)

  // Sync when value changes (e.g., reload from localStorage) but not while editing or if has error
  useEffect(() => {
    if (!isFocused && !error) {
      setRaw(JSON.stringify(value, null, 2))
    }
  }, [value, isFocused, error])

  function handleChange(text: string) {
    setRaw(text)
    try {
      const parsed = JSON.parse(text)
      if (typeof parsed === 'object' && parsed !== null && !Array.isArray(parsed)) {
        onChange(parsed)
        setError(null)
      } else {
        setError('Must be a JSON object {}')
      }
    } catch {
      setError('Invalid JSON')
    }
  }

  function handleBlur() {
    setIsFocused(false)
    // Auto-reset empty field to last valid value
    if (raw.trim() === '') {
      setRaw(JSON.stringify(value, null, 2))
      setError(null)
    }
  }

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <label className="text-xs font-semibold uppercase tracking-widest text-gray-400">{label}</label>
        {hint && <span className="text-xs text-gray-600">{hint}</span>}
      </div>
      <textarea
        rows={rows}
        value={raw}
        onChange={e => handleChange(e.target.value)}
        onFocus={() => setIsFocused(true)}
        onBlur={handleBlur}
        spellCheck={false}
        className={`w-full rounded-lg bg-gray-800 border px-3 py-2 text-sm font-mono resize-y focus:outline-none focus:ring-1 ${
          error
            ? 'border-red-700 focus:ring-red-500'
            : 'border-gray-700 focus:ring-sky-500'
        }`}
      />
      {error && (
        <p className="flex items-center gap-1 text-xs text-red-400">
          <AlertCircle size={12} /> {error}
        </p>
      )}
    </div>
  )
}
