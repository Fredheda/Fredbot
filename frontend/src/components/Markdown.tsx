import type { ComponentProps } from 'react'
import ReactMarkdown, { type ExtraProps } from 'react-markdown'
import rehypeHighlight from 'rehype-highlight'
import remarkGfm from 'remark-gfm'
import { useCopy } from '../hooks/useCopy'
import { CheckIcon, CopyIcon } from './icons'

interface HastNode {
  type: string
  value?: string
  properties?: { className?: unknown }
  children?: HastNode[]
}

const textOf = (node: HastNode): string =>
  node.type === 'text' ? (node.value ?? '') : (node.children ?? []).map(textOf).join('')

function languageOf(node: HastNode): string | undefined {
  const className = node.children?.[0]?.properties?.className
  const classes = Array.isArray(className) ? className.map(String) : []
  return classes.find((c) => c.startsWith('language-'))?.slice('language-'.length)
}

function CodeBlock({ node, children }: ComponentProps<'pre'> & ExtraProps) {
  const { copied, copy } = useCopy()
  const hast = node as HastNode | undefined
  return (
    <div className="not-prose my-4 overflow-hidden rounded-xl border border-white/10 bg-[#0d1117]">
      <div className="flex items-center justify-between border-b border-white/10 bg-white/5 px-4 py-1.5 text-xs text-slate-400">
        <span>{(hast && languageOf(hast)) ?? 'code'}</span>
        <button
          type="button"
          onClick={() => hast && copy(textOf(hast))}
          className="flex items-center gap-1.5 rounded px-1.5 py-0.5 transition hover:bg-white/10 hover:text-white"
        >
          {copied ? <CheckIcon className="size-3.5" /> : <CopyIcon className="size-3.5" />}
          {copied ? 'Copied' : 'Copy code'}
        </button>
      </div>
      <pre className="overflow-x-auto p-4 text-sm leading-relaxed">{children}</pre>
    </div>
  )
}

export function Markdown({ content }: { content: string }) {
  return (
    <div className="prose prose-invert prose-slate prose-a:text-violet-300 prose-code:rounded prose-code:bg-white/10 prose-code:px-1.5 prose-code:py-0.5 prose-code:font-normal prose-code:before:content-none prose-code:after:content-none max-w-none">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeHighlight]}
        components={{ pre: CodeBlock }}
      >
        {content}
      </ReactMarkdown>
    </div>
  )
}
