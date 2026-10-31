import { useEffect, useState } from 'react'

type BackendStatus = 'checking' | 'online' | 'offline'

function useBackendStatus(): BackendStatus {
  const [status, setStatus] = useState<BackendStatus>('checking')

  useEffect(() => {
    const controller = new AbortController()
    fetch('/api/health', { signal: controller.signal })
      .then((res) => setStatus(res.ok ? 'online' : 'offline'))
      .catch(() => {
        if (!controller.signal.aborted) setStatus('offline')
      })
    return () => controller.abort()
  }, [])

  return status
}

const statusStyles: Record<BackendStatus, string> = {
  checking: 'bg-amber-400',
  online: 'bg-emerald-400',
  offline: 'bg-rose-500',
}

export default function App() {
  const status = useBackendStatus()

  return (
    <div className="flex h-full flex-col bg-slate-950 text-slate-100">
      <header className="flex items-center justify-between border-b border-white/10 px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="grid size-9 place-items-center rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-500 font-bold">
            F
          </div>
          <span className="text-lg font-semibold tracking-tight">Fredbot</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-slate-400" aria-live="polite">
          <span className={`size-2 rounded-full ${statusStyles[status]}`} />
          <span>Backend {status}</span>
        </div>
      </header>
      <main className="grid flex-1 place-items-center px-6">
        <div className="max-w-xl text-center">
          <h1 className="bg-gradient-to-r from-violet-300 to-fuchsia-300 bg-clip-text text-4xl font-bold tracking-tight text-transparent">
            Hi, I&apos;m Fredbot
          </h1>
          <p className="mt-4 text-slate-400">
            Your personal AI assistant. The chat experience is coming soon.
          </p>
        </div>
      </main>
    </div>
  )
}
