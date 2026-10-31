import { lazy, Suspense, useLayoutEffect, useRef } from 'react'
import type { ChatMessage, ChatStatus } from '../hooks/useChat'
import { useCopy } from '../hooks/useCopy'
import { AlertIcon, CheckIcon, CopyIcon, RetryIcon } from './icons'
import { Logo } from './Logo'

// Markdown + syntax highlighting is the bulk of the bundle; load it on first reply.
const Markdown = lazy(() => import('./Markdown').then((m) => ({ default: m.Markdown })))

function UserMessage({ content }: { content: string }) {
  return (
    <div className="flex justify-end motion-safe:animate-[fade-in_200ms_ease-out]">
      <div className="max-w-[85%] rounded-2xl rounded-br-md bg-gradient-to-br from-violet-600 to-fuchsia-600 px-4 py-2.5 whitespace-pre-wrap text-white shadow-lg shadow-violet-900/20">
        {content}
      </div>
    </div>
  )
}

function AssistantMessage({ content, streaming }: { content: string; streaming: boolean }) {
  const { copied, copy } = useCopy()
  return (
    <div className="group flex gap-3 motion-safe:animate-[fade-in_200ms_ease-out]">
      <Logo className="mt-0.5 size-8 text-sm" />
      <div className="min-w-0 flex-1">
        <Suspense fallback={<p className="whitespace-pre-wrap text-slate-300">{content}</p>}>
          <Markdown content={content} />
        </Suspense>
        {streaming ? (
          <span className="mt-1 inline-block h-4 w-2 rounded-sm bg-violet-300 motion-safe:animate-pulse" />
        ) : (
          <button
            type="button"
            onClick={() => copy(content)}
            className="mt-2 flex items-center gap-1.5 rounded px-1.5 py-0.5 text-xs text-slate-500 opacity-100 transition group-hover:opacity-100 hover:bg-white/5 hover:text-slate-200 focus-visible:opacity-100 sm:opacity-0"
          >
            {copied ? <CheckIcon className="size-3.5" /> : <CopyIcon className="size-3.5" />}
            {copied ? 'Copied' : 'Copy'}
          </button>
        )}
      </div>
    </div>
  )
}

function TypingIndicator() {
  return (
    <div className="flex items-center gap-3" role="status" aria-label="Fredbot is thinking">
      <Logo className="size-8 text-sm" />
      <div className="flex gap-1 rounded-2xl bg-white/5 px-4 py-3">
        {['[animation-delay:-0.3s]', '[animation-delay:-0.15s]', ''].map((delay) => (
          <span
            key={delay}
            className={`size-1.5 rounded-full bg-slate-400 motion-safe:animate-bounce ${delay}`}
          />
        ))}
      </div>
    </div>
  )
}

function ErrorBanner({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div
      role="alert"
      className="flex items-start gap-3 rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-100"
    >
      <AlertIcon className="mt-0.5 size-4 shrink-0 text-rose-400" />
      <p className="flex-1">{message}</p>
      <button
        type="button"
        onClick={onRetry}
        className="flex items-center gap-1.5 rounded-md border border-rose-400/30 px-2.5 py-1 text-xs font-medium transition hover:bg-rose-500/20"
      >
        <RetryIcon className="size-3.5" />
        Retry
      </button>
    </div>
  )
}

interface MessageListProps {
  messages: ChatMessage[]
  status: ChatStatus
  error: string | null
  onRetry: () => void
}

export function MessageList({ messages, status, error, onRetry }: MessageListProps) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const stickToBottom = useRef(true)

  useLayoutEffect(() => {
    const el = scrollRef.current
    if (el && stickToBottom.current) el.scrollTop = el.scrollHeight
  }, [messages, status, error])

  const last = messages.at(-1)

  return (
    <div
      ref={scrollRef}
      onScroll={(e) => {
        const el = e.currentTarget
        stickToBottom.current = el.scrollHeight - el.scrollTop - el.clientHeight < 80
      }}
      className="flex-1 overflow-y-auto"
    >
      <div
        role="log"
        aria-label="Conversation"
        className="mx-auto flex max-w-3xl flex-col gap-6 px-4 py-8"
      >
        {messages.map((m) =>
          m.role === 'user' ? (
            <UserMessage key={m.id} content={m.content} />
          ) : (
            <AssistantMessage
              key={m.id}
              content={m.content}
              streaming={status === 'streaming' && m === last}
            />
          ),
        )}
        {status === 'waiting' && <TypingIndicator />}
        {error && <ErrorBanner message={error} onRetry={onRetry} />}
      </div>
    </div>
  )
}
