import { useLayoutEffect, useRef, useState } from 'react'
import { ArrowUpIcon, StopIcon } from './icons'

interface ComposerProps {
  onSend: (text: string) => void
  onStop: () => void
  isRunning: boolean
  disabled: boolean
}

const MAX_HEIGHT_PX = 200

export function Composer({ onSend, onStop, isRunning, disabled }: ComposerProps) {
  const [value, setValue] = useState('')
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const canSend = value.trim().length > 0 && !isRunning && !disabled

  useLayoutEffect(() => {
    const el = textareaRef.current
    if (!el) return
    el.style.height = 'auto'
    el.style.height = `${Math.min(el.scrollHeight, MAX_HEIGHT_PX)}px`
  }, [value])

  function submit() {
    if (!canSend) return
    onSend(value)
    setValue('')
  }

  return (
    <div className="px-4 pb-4 sm:pb-6">
      <form
        onSubmit={(e) => {
          e.preventDefault()
          submit()
        }}
        className="mx-auto flex max-w-3xl items-end gap-2 rounded-2xl border border-white/10 bg-slate-900/80 p-2 shadow-2xl shadow-black/40 backdrop-blur transition focus-within:border-violet-400/50 focus-within:ring-4 focus-within:ring-violet-500/10"
      >
        <textarea
          ref={textareaRef}
          rows={1}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing) {
              e.preventDefault()
              submit()
            }
          }}
          aria-label="Message Fredbot"
          placeholder={disabled ? 'Fredbot is offline…' : 'Message Fredbot…'}
          className="max-h-[200px] flex-1 resize-none bg-transparent px-3 py-2 text-slate-100 placeholder:text-slate-500 focus:outline-none"
        />
        {isRunning ? (
          <button
            type="button"
            onClick={onStop}
            aria-label="Stop generating"
            className="grid size-10 shrink-0 place-items-center rounded-xl bg-white text-slate-900 transition hover:bg-slate-200"
          >
            <StopIcon />
          </button>
        ) : (
          <button
            type="submit"
            disabled={!canSend}
            aria-label="Send message"
            className="grid size-10 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-500 text-white shadow-lg shadow-violet-500/25 transition hover:brightness-110 disabled:from-slate-700 disabled:to-slate-700 disabled:text-slate-400 disabled:shadow-none"
          >
            <ArrowUpIcon />
          </button>
        )}
      </form>
      <p className="mt-2 text-center text-xs text-slate-500">
        Fredbot can make mistakes.{' '}
        <span className="hidden sm:inline">Enter to send, Shift+Enter for a new line.</span>
      </p>
    </div>
  )
}
