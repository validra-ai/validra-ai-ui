import { useState } from 'react'
import { ChevronDown, ChevronRight, Info } from 'lucide-react'
import type { Provider, ProviderConfig } from '../../types'

// ── Defaults match server-side config defaults ─────────────────────────────
const DEFAULTS: Record<Provider, ProviderConfig> = {
  ollama:    { model: 'llama3:8b-instruct-q4_0',   temperature: 0.3, max_tokens: 700 },
  openai:    { model: 'gpt-4o-mini',               temperature: 0.3, max_tokens: 700 },
  anthropic: { model: 'claude-haiku-4-5-20251001', temperature: 0.3, max_tokens: 700 },
}

const PROVIDER_MODELS: Record<Provider, Array<{ value: string; label: string }>> = {
  anthropic: [
    { value: 'claude-haiku-4-5-20251001', label: 'Haiku 4.5 — fastest & cheapest' },
    { value: 'claude-sonnet-4-6',         label: 'Sonnet 4.6 — balanced' },
    { value: 'claude-opus-4-6',           label: 'Opus 4.6 — most capable' },
  ],
  openai: [
    { value: 'gpt-4o-mini', label: 'GPT-4o mini — fastest & cheapest' },
    { value: 'gpt-4o',      label: 'GPT-4o — balanced' },
    { value: 'o1-mini',     label: 'o1 mini — reasoning model' },
  ],
  ollama: [
    { value: 'llama3:8b-instruct-q4_0', label: 'Llama 3 8B Q4 — good balance' },
    { value: 'llama3:70b',              label: 'Llama 3 70B — more capable, slower' },
    { value: 'mistral:7b-instruct',     label: 'Mistral 7B — fast alternative' },
  ],
}

// Validation model auto-upgrade (server-side behaviour)
const VALIDATION_UPGRADE: Record<Provider, string | null> = {
  anthropic: 'claude-sonnet-4-6',
  openai:    'gpt-4o',
  ollama:    null,
}

const PROVIDER_NOTES: Record<Provider, string | null> = {
  anthropic: 'Prompt caching is enabled automatically — static instructions are cached after the first call, cutting input-token costs by ~90% on subsequent batches.',
  openai:    null,
  ollama:    'Make sure Ollama is running locally (ollama serve). No API key needed.',
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
    Object.keys(next).forEach(k => {
      if (next[k as keyof ProviderConfig] === '' || next[k as keyof ProviderConfig] === undefined)
        delete next[k as keyof ProviderConfig]
    })
    onChange(Object.keys(next).length ? next : undefined)
  }

  const defaults = DEFAULTS[provider]
  const models = PROVIDER_MODELS[provider]
  const validationModel = VALIDATION_UPGRADE[provider]
  const providerNote = PROVIDER_NOTES[provider]

  // The active generation model: what the user selected, or the provider default
  const activeGenModel = cfg.model ?? defaults.model ?? ''
  // The active validation model: server always upgrades, regardless of override
  const activeValModel = validationModel ?? activeGenModel

  // Short display name for the collapsed header (trim long IDs)
  function shortName(id: string) {
    const known = models.find(m => m.value === id)
    if (known) return known.label.split(' —')[0]
    return id.length > 24 ? id.slice(0, 22) + '…' : id
  }

  return (
    <div className="rounded-lg border border-gray-800 overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-4 py-2.5 bg-gray-800/50 hover:bg-gray-800 transition-colors"
      >
        <div className="flex flex-col items-start gap-0.5">
          <span className="text-xs font-semibold uppercase tracking-widest text-gray-400">
            Provider Override (optional)
          </span>
          <span className="text-xs text-gray-600 font-mono">
            gen: <span className="text-gray-400">{shortName(activeGenModel)}</span>
            {' · '}
            val: <span className="text-gray-400">{shortName(activeValModel)}</span>
          </span>
        </div>
        {open ? <ChevronDown size={14} className="text-gray-400 shrink-0" /> : <ChevronRight size={14} className="text-gray-400 shrink-0" />}
      </button>

      {open && (
        <div className="p-4 space-y-4 bg-gray-900/50">

          {/* ── Model ─────────────────────────────────────────────────────── */}
          <div className="space-y-1.5">
            <label className="text-xs text-gray-500">Generation Model</label>
            <select
              value={activeGenModel}
              onChange={e => set('model', e.target.value)}
              className="w-full rounded-lg bg-gray-800 border border-gray-700 px-2 py-1.5 text-xs font-mono text-gray-200 focus:outline-none focus:ring-1 focus:ring-sky-500"
            >
              {models.map(m => (
                <option key={m.value} value={m.value}>{m.label}</option>
              ))}
            </select>
            {validationModel && (
              <p className="text-xs text-gray-600">
                Validation auto-upgrades to{' '}
                <span className="font-mono text-gray-400">{validationModel}</span>
                {' '}— override above affects generation only.
              </p>
            )}
          </div>

          {/* ── Provider-specific field (URL / API key) ────────────────── */}
          {provider === 'ollama' && (
            <Field
              label="URL"
              placeholder="http://localhost:11434/api/generate"
              value={cfg.url ?? ''}
              onChange={v => set('url', v)}
              hint="Override if Ollama runs on a non-default address or port."
            />
          )}
          {(provider === 'openai' || provider === 'anthropic') && (
            <Field
              label="API Key"
              placeholder={provider === 'openai' ? 'sk-...' : 'sk-ant-...'}
              type="password"
              value={cfg.api_key ?? ''}
              onChange={v => set('api_key', v)}
              hint="Only needed here if you haven't set the env variable."
            />
          )}

          {/* ── Temperature + Max Tokens ───────────────────────────────── */}
          <div className="grid grid-cols-2 gap-3">
            <Field
              label="Temperature"
              placeholder={String(defaults.temperature ?? 0.3)}
              type="number"
              value={cfg.temperature !== undefined ? String(cfg.temperature) : ''}
              onChange={v => set('temperature', v ? parseFloat(v) : undefined)}
              hint="0 = deterministic · 1 = creative. Keep ≤ 0.3 for reliable JSON output."
            />
            <Field
              label="Max Tokens"
              placeholder={String(defaults.max_tokens ?? 700)}
              type="number"
              value={cfg.max_tokens !== undefined ? String(cfg.max_tokens) : ''}
              onChange={v => set('max_tokens', v ? parseInt(v) : undefined)}
              hint="Output budget. 700 safely fits 3 test cases. Validation auto-uses 150."
            />
          </div>

          {/* ── Info box ──────────────────────────────────────────────────── */}
          <div className="rounded-lg bg-gray-800/60 border border-gray-700/50 p-3">
            <div className="flex items-start gap-2 text-xs text-gray-400">
              <Info size={13} className="shrink-0 mt-0.5 text-sky-500" />
              <div className="space-y-1.5">
                <p>
                  <span className="font-semibold text-gray-300">Active models</span>
                  {' — '}
                  generation: <span className="font-mono text-sky-400">{activeGenModel}</span>
                  {' · '}
                  validation: <span className="font-mono text-sky-400">{activeValModel}</span>
                </p>
                {providerNote && (
                  <p className="text-gray-500">{providerNote}</p>
                )}
              </div>
            </div>
          </div>

        </div>
      )}
    </div>
  )
}

function Field({
  label, placeholder, value, onChange, type = 'text', hint,
}: {
  label: string
  placeholder: string
  value: string
  onChange: (v: string) => void
  type?: string
  hint?: string
}) {
  const id = label.toLowerCase().replace(/\s+/g, '-')
  return (
    <div className="space-y-1">
      <label htmlFor={id} className="text-xs text-gray-500">{label}</label>
      <input
        id={id}
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={e => onChange(e.target.value)}
        className="w-full rounded-lg bg-gray-800 border border-gray-700 px-2 py-1.5 text-xs font-mono placeholder-gray-600 focus:outline-none focus:ring-1 focus:ring-sky-500"
      />
      {hint && <p className="text-xs text-gray-600">{hint}</p>}
    </div>
  )
}
