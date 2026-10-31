import { Composer } from './components/Composer'
import { Header } from './components/Header'
import { MessageList } from './components/MessageList'
import { Welcome } from './components/Welcome'
import { useBackendStatus } from './hooks/useBackendStatus'
import { useChat } from './hooks/useChat'

export default function App() {
  const backendStatus = useBackendStatus()
  const chat = useChat()
  const offline = backendStatus === 'offline'
  const isEmpty = chat.messages.length === 0 && !chat.isRunning

  return (
    <div className="flex h-dvh flex-col bg-slate-950 bg-[radial-gradient(ellipse_80%_50%_at_50%_-10%,rgba(139,92,246,0.18),transparent)] text-slate-100">
      <Header
        status={backendStatus}
        onNewChat={chat.newChat}
        canStartNewChat={!isEmpty || chat.error !== null}
      />
      <main className="flex min-h-0 flex-1 flex-col">
        {isEmpty && !chat.error ? (
          <Welcome onPick={chat.send} disabled={offline} />
        ) : (
          <MessageList
            messages={chat.messages}
            status={chat.status}
            error={chat.error}
            onRetry={chat.retry}
          />
        )}
        <Composer
          onSend={chat.send}
          onStop={chat.stop}
          isRunning={chat.isRunning}
          disabled={offline}
        />
      </main>
    </div>
  )
}
