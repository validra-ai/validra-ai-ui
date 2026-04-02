import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { ProviderConfigPanel } from './ProviderConfig'
import type { Provider } from '../../types'

function renderPanel(provider: Provider = 'anthropic', value = undefined, onChange = vi.fn()) {
  const result = render(<ProviderConfigPanel provider={provider} value={value} onChange={onChange} />)
  return { ...result, onChange }
}

function openPanel(provider: Provider = 'anthropic', value = undefined, onChange = vi.fn()) {
  const result = renderPanel(provider, value, onChange)
  fireEvent.click(screen.getByRole('button'))
  return { ...result, onChange }
}

// ── Model select ─────────────────────────────────────────────────────────────

it('renders exactly 3 model options for anthropic', () => {
  openPanel('anthropic')
  expect(screen.getAllByRole('option')).toHaveLength(3)
})

it('renders exactly 3 model options for openai', () => {
  openPanel('openai')
  expect(screen.getAllByRole('option')).toHaveLength(3)
})

it('renders exactly 3 model options for ollama', () => {
  openPanel('ollama')
  expect(screen.getAllByRole('option')).toHaveLength(3)
})

it('selects the default model when no value is provided', () => {
  openPanel('anthropic')
  const select = screen.getByRole('combobox') as HTMLSelectElement
  expect(select.value).toBe('claude-haiku-4-5-20251001')
})

it('calls onChange with the selected model when user picks a new option', () => {
  const { onChange } = openPanel('anthropic')
  fireEvent.change(screen.getByRole('combobox'), { target: { value: 'claude-sonnet-4-6' } })
  expect(onChange).toHaveBeenCalledWith(expect.objectContaining({ model: 'claude-sonnet-4-6' }))
})

it('reflects a pre-set model value in the select', () => {
  openPanel('openai', { model: 'gpt-4o' } as any)
  const select = screen.getByRole('combobox') as HTMLSelectElement
  expect(select.value).toBe('gpt-4o')
})

// ── Validation upgrade display ────────────────────────────────────────────────

it('shows the validation upgrade model for anthropic', () => {
  openPanel('anthropic')
  // The model ID appears in both the hint and the info box — at least one must exist
  expect(screen.getAllByText(/claude-sonnet-4-6/).length).toBeGreaterThan(0)
})

it('shows the validation upgrade model for openai', () => {
  openPanel('openai')
  expect(screen.getAllByText(/gpt-4o/).length).toBeGreaterThan(0)
})

// ── Collapsed header shows active models ─────────────────────────────────────

it('shows active generation model short name in the collapsed header', () => {
  const { container } = renderPanel('anthropic')
  // The header subtitle is the second span inside the button
  const header = container.querySelector('button span:last-child') as HTMLElement
  expect(header.textContent).toContain('Haiku 4.5')
})

it('shows active validation model short name in the collapsed header', () => {
  const { container } = renderPanel('anthropic')
  const header = container.querySelector('button span:last-child') as HTMLElement
  expect(header.textContent).toContain('Sonnet 4.6')
})

it('shows the selected model short name in the header when value prop is provided', () => {
  const { container } = renderPanel('openai', { model: 'o1-mini' } as any)
  const header = container.querySelector('button span:last-child') as HTMLElement
  expect(header.textContent).toContain('o1 mini')
})

// ── Provider-specific fields ──────────────────────────────────────────────────

it('shows URL field for ollama', () => {
  openPanel('ollama')
  expect(screen.getByLabelText(/URL/i)).toBeInTheDocument()
})

it('shows API Key field for openai', () => {
  openPanel('openai')
  expect(screen.getByLabelText(/API Key/i)).toBeInTheDocument()
})

it('shows API Key field for anthropic', () => {
  openPanel('anthropic')
  expect(screen.getByLabelText(/API Key/i)).toBeInTheDocument()
})

it('does not show API Key field for ollama', () => {
  openPanel('ollama')
  expect(screen.queryByLabelText(/API Key/i)).not.toBeInTheDocument()
})

// ── Temperature / Max Tokens ──────────────────────────────────────────────────

describe('temperature and max_tokens fields', () => {
  it('calls onChange with parsed float for temperature', () => {
    const { onChange } = openPanel('anthropic')
    fireEvent.change(screen.getByLabelText(/Temperature/i), { target: { value: '0.5' } })
    expect(onChange).toHaveBeenCalledWith(expect.objectContaining({ temperature: 0.5 }))
  })

  it('calls onChange with parsed int for max_tokens', () => {
    const { onChange } = openPanel('anthropic')
    fireEvent.change(screen.getByLabelText(/Max Tokens/i), { target: { value: '300' } })
    expect(onChange).toHaveBeenCalledWith(expect.objectContaining({ max_tokens: 300 }))
  })
})
