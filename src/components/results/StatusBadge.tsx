import clsx from 'clsx'
import type { DStatus } from '../../types'

interface Props {
  status: DStatus
  size?: 'sm' | 'md'
}

const MAP: Record<DStatus, { bg: string; text: string; label: string }> = {
  PASS: { bg: 'bg-pass-bg border border-pass-border', text: 'text-pass-text', label: 'PASS' },
  FAIL: { bg: 'bg-fail-bg border border-fail-border', text: 'text-fail-text', label: 'FAIL' },
  WARN: { bg: 'bg-warn-bg border border-warn-border', text: 'text-warn-text', label: 'WARN' },
}

export function StatusBadge({ status, size = 'md' }: Props) {
  const s = MAP[status]
  return (
    <span
      className={clsx(
        'inline-flex items-center font-bold rounded',
        s.bg, s.text,
        size === 'sm' ? 'text-xs px-1.5 py-0.5' : 'text-sm px-2 py-0.5',
      )}
    >
      {s.label}
    </span>
  )
}
