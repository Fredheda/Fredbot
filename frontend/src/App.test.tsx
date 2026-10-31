import { render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import App from './App'

describe('App', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('shows the backend as online when the health check succeeds', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true }))
    render(<App />)
    expect(screen.getByRole('heading', { name: /fredbot/i })).toBeInTheDocument()
    expect(await screen.findByText('Backend online')).toBeInTheDocument()
  })

  it('shows the backend as offline when the health check fails', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('down')))
    render(<App />)
    expect(await screen.findByText('Backend offline')).toBeInTheDocument()
  })
})
