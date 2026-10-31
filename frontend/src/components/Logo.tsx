export function Logo({ className = 'size-9 text-base' }: { className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={`grid shrink-0 place-items-center rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-500 font-bold text-white shadow-lg shadow-violet-500/20 ${className}`}
    >
      F
    </div>
  )
}
