import type { BackendStatus } from '../hooks/useBackendStatus'
import { PenIcon } from './icons'
import { Logo } from './Logo'

const statusStyles: Record<BackendStatus, string> = {
  checking: 'bg-amber-400',
  online: 'bg-emerald-400',
  offline: 'bg-rose-500',
}

interface HeaderProps {
  status: BackendStatus
  onNewChat: () => void
  canStartNewChat: boolean
}

export function Header({ status, onNewChat, canStartNewChat }: HeaderProps) {
  return (
    <header className="flex items-center justify-between border-b border-white/5 px-4 py-3 sm:px-6">
      <div className="flex items-center gap-3">
        <Logo />
        <div className="leading-tight">
          <span className="block text-base font-semibold tracking-tight">Fredbot</span>
          <span className="flex items-center gap-1.5 text-xs text-slate-400" aria-live="polite">
            <span className={`size-1.5 rounded-full ${statusStyles[status]}`} />
            Backend {status}
          </span>
        </div>
      </div>
      <button
        type="button"
        onClick={onNewChat}
        aria-label="New chat"
        disabled={!canStartNewChat}
        className="flex items-center gap-2 rounded-lg border border-white/10 px-3 py-1.5 text-sm text-slate-300 transition hover:border-white/20 hover:bg-white/5 hover:text-white disabled:pointer-events-none disabled:opacity-40"
      >
        <PenIcon />
        <span className="hidden sm:inline">New chat</span>
      </button>
    </header>
  )
}
