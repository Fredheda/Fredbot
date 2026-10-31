import { Logo } from './Logo'

const suggestions = [
  { title: 'Explain a concept', prompt: 'Explain how large language models work in simple terms' },
  {
    title: 'Write some code',
    prompt: 'Write a Python function that checks if a string is a palindrome',
  },
  { title: 'Plan something', prompt: 'Help me plan a relaxing weekend in London' },
  { title: 'Brainstorm ideas', prompt: 'Give me 5 creative names for a personal AI assistant' },
]

export function Welcome({
  onPick,
  disabled,
}: {
  onPick: (prompt: string) => void
  disabled: boolean
}) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center overflow-y-auto px-4 py-10">
      <div className="w-full max-w-2xl text-center motion-safe:animate-[fade-in_400ms_ease-out]">
        <Logo className="mx-auto size-14 text-2xl" />
        <h1 className="mt-6 bg-gradient-to-r from-violet-300 via-fuchsia-300 to-pink-300 bg-clip-text text-3xl font-bold tracking-tight text-transparent sm:text-4xl">
          Hi, I&apos;m Fredbot
        </h1>
        <p className="mt-3 text-slate-400">How can I help you today?</p>
        <div className="mt-10 grid gap-3 sm:grid-cols-2">
          {suggestions.map((s) => (
            <button
              key={s.title}
              type="button"
              disabled={disabled}
              onClick={() => onPick(s.prompt)}
              className="group rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-left transition hover:border-violet-400/40 hover:bg-violet-500/10 disabled:pointer-events-none disabled:opacity-50"
            >
              <span className="block text-sm font-medium text-slate-200 group-hover:text-white">
                {s.title}
              </span>
              <span className="mt-0.5 block text-sm text-slate-400">{s.prompt}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
