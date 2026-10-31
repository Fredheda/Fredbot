import { HttpAgent, type AbstractAgent, type Message } from '@ag-ui/client'
import { useRef, useState } from 'react'

export interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
}

export type ChatStatus = 'idle' | 'waiting' | 'streaming'

const CONNECTION_ERROR = "Couldn't reach Fredbot. Check that the backend is running and try again."

const createAgent = (): AbstractAgent => new HttpAgent({ url: '/api/agent' })

function toChatMessages(messages: readonly Message[]): ChatMessage[] {
  return messages.flatMap((m) =>
    (m.role === 'user' || m.role === 'assistant') && typeof m.content === 'string' && m.content
      ? [{ id: m.id, role: m.role, content: m.content }]
      : [],
  )
}

export function useChat() {
  const agentRef = useRef<AbstractAgent | null>(null)
  const stoppedRef = useRef(false)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [status, setStatus] = useState<ChatStatus>('idle')
  const [error, setError] = useState<string | null>(null)

  const getAgent = () => (agentRef.current ??= createAgent())

  async function run() {
    const agent = getAgent()
    stoppedRef.current = false
    setError(null)
    setStatus('waiting')
    let runError: string | null = null
    try {
      await agent.runAgent(
        { runId: crypto.randomUUID() },
        {
          onMessagesChanged: ({ messages }) => setMessages(toChatMessages(messages)),
          onTextMessageStartEvent: () => setStatus('streaming'),
          onRunErrorEvent: ({ event }) => {
            runError = event.message
          },
        },
      )
    } catch {
      if (!stoppedRef.current) runError ??= CONNECTION_ERROR
    }
    if (agentRef.current !== agent) return
    setMessages(toChatMessages(agent.messages))
    setError(runError)
    setStatus('idle')
  }

  function send(text: string) {
    const content = text.trim()
    if (!content || status !== 'idle') return
    const agent = getAgent()
    agent.addMessage({ id: crypto.randomUUID(), role: 'user', content })
    setMessages(toChatMessages(agent.messages))
    void run()
  }

  function stop() {
    stoppedRef.current = true
    agentRef.current?.abortRun()
  }

  function retry() {
    const agent = getAgent()
    const lastUser = agent.messages.findLastIndex((m) => m.role === 'user')
    agent.setMessages(agent.messages.slice(0, lastUser + 1))
    setMessages(toChatMessages(agent.messages))
    void run()
  }

  function newChat() {
    stop()
    agentRef.current = createAgent()
    setMessages([])
    setError(null)
    setStatus('idle')
  }

  return { messages, status, error, isRunning: status !== 'idle', send, stop, retry, newChat }
}
