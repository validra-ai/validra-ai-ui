import { useState } from 'react'
import { ChevronDown, ChevronRight } from 'lucide-react'
import type { Provider, ProviderConfig } from '../../types'

const DEFAULTS: Record<Provider, ProviderConfig> = {
  ollama:    { model: 'llama3:8b-instruct-q4_0', temperature: 0.7, max_tokens: 700 },
  openai:    { model: 'gpt-4o',                  temperature: 0.7, max_tokens: 700 },
  anthropic: { model: 'claude-sonnet-4-6',        temperature: 0.7, max_tokens: 700 },
}

interface Props {
  provider: Provider
  value?: ProviderConfig
  onChange: (v: ProviderConfig | undefined) => void
}

export function ProviderConfigPanel({ provider, value, onChange }: Props) {
  const [open, setOpen] = useState(false)
  const cfg = value ?? {}

  function set(key: keyof ProviderConfig, val: string | number | undefined) {
    const next = { ...cfg, [key]: val }
    // strip empty keys
    Object.keys(next).forEach(k => {
      if (next[k as keyof ProviderConfig] === '' || next[k as keyof ProviderConfig] === undefined)
        delete next[k as keyof ProviderConfig]
    })
    onChange(Object.keys(next).length ? next : undefined)
  }

  const defaults = DEFAULTS[provider]

  return (
    <div className="rounded-lg border border-gray-800 overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-4 py-2.5 bg-gray-800/50 hover:bg-gray-800 text-xs font-semibold uppercase tracking-widest text-gray-400 transition-colors"
      >
        <span>Provider Override (optional)</span>
        {open ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
      </button>

      {open && (
        <div className="p-4 space-y-3 bg-gray-900/50">
          <div className="grid grid-cols-2 gap-3">
            <Field
              label="Model"
              placeholder={defaults.model ?? ''}
              value={cfg.model ?? ''}
              onChange={v => set('model', v)}
            />
            {provider === 'ollama' && (
              <Field
                label="URL"
                placeholder="http://localhost:11434/api/generate"
                value={cfg.url ?? ''}
                onChange={v => set('url', v)}
              />
            )}
            {(provider === 'openai' || provider === 'anthropic') && (
              <Field
                label="API Key"
                placeholder="sk-..."
                type="password"
                value={cfg.api_key ?? ''}
                onChange={v => set('api_key', v)}
              />
            )}
            <Field
              label="Temperature"
              placeholder="0.7"
              type="number"
              value={cfg.temperature !== undefined ? String(cfg.temperature) : ''}
              onChange={v => set('temperature', v ? parseFloat(v) : undefined)}
            />
            <Field
              label="Max Tokens"
              placeholder="700"
              type="number"
              value={cfg.max_tokens !== undefined ? String(cfg.max_tokens) : ''}
              onChange={v => set('max_tokens', v ? parseInt(v) : undefined)}
            />
          </div>
        </div>
      )}
    </div>
  )
}

function Field({
  label, placeholder, value, onChange, type = 'text',
}: {
  label: string
  placeholder: string
  value: string
  onChange: (v: string) => void
  type?: string
}) {
  return (
    <div className="space-y-1">
      <label className="text-xs text-gray-500">{label}</label>
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={e => onChange(e.target.value)}
        className="w-full rounded-lg bg-gray-800 border border-gray-700 px-2 py-1.5 text-xs font-mono placeholder-gray-600 focus:outline-none focus:ring-1 focus:ring-sky-500"
      />
    </div>
  )
}
