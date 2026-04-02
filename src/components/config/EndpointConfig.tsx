import type { HttpMethod, TestRequest } from '../../types'

const METHODS: HttpMethod[] = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE']

interface Props {
  value: Pick<TestRequest, 'endpoint' | 'method'>
  onChange: (v: Partial<TestRequest>) => void
}

export function EndpointConfig({ value, onChange }: Props) {
  return (
    <div className="space-y-3">
      <h3 className="text-xs font-semibold uppercase tracking-widest text-gray-400">Endpoint</h3>
      <div className="flex gap-2">
        <select
          value={value.method}
          onChange={e => onChange({ method: e.target.value as HttpMethod })}
          className="rounded-lg bg-gray-800 border border-gray-700 px-3 py-2 text-sm font-mono text-sky-300 focus:outline-none focus:ring-1 focus:ring-sky-500"
        >
          {METHODS.map(m => (
            <option key={m} value={m}>{m}</option>
          ))}
        </select>
        <input
          type="url"
          placeholder="https://api.example.com/v1/endpoint"
          value={value.endpoint}
          onChange={e => onChange({ endpoint: e.target.value })}
          className="flex-1 rounded-lg bg-gray-800 border border-gray-700 px-3 py-2 text-sm font-mono placeholder-gray-600 focus:outline-none focus:ring-1 focus:ring-sky-500"
        />
      </div>
    </div>
  )
}
