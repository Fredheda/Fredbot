import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import App from './App'

type AgUiEvent = Record<string, unknown>

function sse(events: AgUiEvent[]): Response {
  const body = events.map((e) => `data: ${JSON.stringify(e)}\n\n`).join('')
  return new Response(body, { headers: { 'Content-Type': 'text/event-stream' } })
}

let replyCount = 0

function reply(text: string): AgUiEvent[] {
  const messageId = `m${++replyCount}`
  return [
    { type: 'RUN_STARTED', threadId: 't', runId: 'r' },
    { type: 'TEXT_MESSAGE_START', messageId, role: 'assistant' },
    ...text.split(' ').map((word, i) => ({
      type: 'TEXT_MESSAGE_CONTENT',
      messageId,
      delta: i === 0 ? word : ` ${word}`,
    })),
    { type: 'TEXT_MESSAGE_END', messageId },
    { type: 'RUN_FINISHED', threadId: 't', runId: 'r' },
  ]
}

let healthOk: boolean
let agentResponses: Response[]
let agentRequests: { messages: { role: string; content: string }[] }[]

beforeEach(() => {
  healthOk = true
  agentResponses = []
  agentRequests = []
  vi.stubGlobal(
    'fetch',
    vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
      const url = String(input)
      if (url.endsWith('/api/health')) {
        if (!healthOk) throw new TypeError('Failed to fetch')
        return new Response('{"status":"ok"}')
      }
      agentRequests.push(JSON.parse(String(init?.body)))
      const response = agentResponses.shift()
      if (!response) throw new TypeError('Failed to fetch')
      return response
    }),
  )
})

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('App', () => {
  it('shows backend status from the health endpoint', async () => {
    render(<App />)
    expect(await screen.findByText('Backend online')).toBeInTheDocument()
  })

  it('shows offline status and disables sending when the backend is unreachable', async () => {
    healthOk = false
    render(<App />)
    expect(await screen.findByText('Backend offline')).toBeInTheDocument()
    expect(screen.getByLabelText('Message Fredbot')).toHaveAttribute(
      'placeholder',
      'Fredbot is offline…',
    )
  })

  it('sends a message with Enter and renders the streamed Markdown reply', async () => {
    const user = userEvent.setup()
    agentResponses.push(sse(reply('Hello **Fred**, nice to meet you')))
    render(<App />)

    await user.type(screen.getByLabelText('Message Fredbot'), 'Hi there{Enter}')

    expect(await screen.findByText('Fred', { selector: 'strong' })).toBeInTheDocument()
    expect(screen.getByText('Hi there')).toBeInTheDocument()
    expect(agentRequests[0].messages).toMatchObject([{ role: 'user', content: 'Hi there' }])
    expect(screen.getByLabelText('Message Fredbot')).toHaveValue('')
  })

  it('sends the full conversation history on follow-up messages', async () => {
    const user = userEvent.setup()
    agentResponses.push(sse(reply('Nice to meet you')), sse(reply('You are Fred')))
    render(<App />)
    const input = screen.getByLabelText('Message Fredbot')

    await user.type(input, 'I am Fred{Enter}')
    await screen.findByText('Nice to meet you')
    await user.type(input, 'Who am I?{Enter}')
    await screen.findByText('You are Fred')

    expect(agentRequests[1].messages.map((m) => [m.role, m.content])).toEqual([
      ['user', 'I am Fred'],
      ['assistant', 'Nice to meet you'],
      ['user', 'Who am I?'],
    ])
  })

  it('inserts a newline with Shift+Enter instead of sending', async () => {
    const user = userEvent.setup()
    render(<App />)
    const input = screen.getByLabelText('Message Fredbot')

    expect(screen.getByRole('button', { name: 'Send message' })).toBeDisabled()
    await user.type(input, 'line one{Shift>}{Enter}{/Shift}line two')

    expect(input).toHaveValue('line one\nline two')
    expect(agentRequests).toHaveLength(0)
  })

  it('sends a suggestion when clicked', async () => {
    const user = userEvent.setup()
    agentResponses.push(sse(reply('Here is a plan')))
    render(<App />)
    await screen.findByText('Backend online')

    await user.click(screen.getByRole('button', { name: /Plan something/ }))

    expect(await screen.findByText('Here is a plan')).toBeInTheDocument()
    expect(agentRequests[0].messages[0].content).toBe('Help me plan a relaxing weekend in London')
  })

  it('shows backend RUN_ERROR messages and recovers on retry', async () => {
    const user = userEvent.setup()
    agentResponses.push(
      sse([
        { type: 'RUN_STARTED', threadId: 't', runId: 'r' },
        { type: 'RUN_ERROR', message: 'The model provider is rate limiting requests.' },
      ]),
      sse(reply('Back again')),
    )
    render(<App />)

    await user.type(screen.getByLabelText('Message Fredbot'), 'Hello{Enter}')
    expect(await screen.findByRole('alert')).toHaveTextContent('rate limiting')

    await user.click(screen.getByRole('button', { name: 'Retry' }))

    expect(await screen.findByText('Back again')).toBeInTheDocument()
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
    expect(agentRequests[1].messages).toMatchObject([{ role: 'user', content: 'Hello' }])
  })

  it('shows a connection error when the agent cannot be reached', async () => {
    const user = userEvent.setup()
    render(<App />)

    await user.type(screen.getByLabelText('Message Fredbot'), 'Hello{Enter}')

    expect(await screen.findByRole('alert')).toHaveTextContent("Couldn't reach Fredbot")
  })

  it('starts a new chat', async () => {
    const user = userEvent.setup()
    agentResponses.push(sse(reply('First reply')))
    render(<App />)

    await user.type(screen.getByLabelText('Message Fredbot'), 'Hello{Enter}')
    await screen.findByText('First reply')
    await user.click(screen.getByRole('button', { name: 'New chat' }))

    await waitFor(() => expect(screen.queryByText('First reply')).not.toBeInTheDocument())
    expect(screen.getByText(/Hi, I.m Fredbot/)).toBeInTheDocument()
  })
})
