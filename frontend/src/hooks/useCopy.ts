import { useEffect, useState } from 'react'

export function useCopy(resetAfterMs = 1500) {
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (!copied) return
    const timer = setTimeout(() => setCopied(false), resetAfterMs)
    return () => clearTimeout(timer)
  }, [copied, resetAfterMs])

  const copy = (text: string) => {
    navigator.clipboard
      ?.writeText(text)
      .then(() => setCopied(true))
      .catch(() => setCopied(false))
  }

  return { copied, copy }
}
