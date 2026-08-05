import { type ReactNode } from 'react'

interface DocWorkspaceProps {
  title: string
  subtitle: string
  badge?: ReactNode
  panel: ReactNode
  children: ReactNode
}

export function DocWorkspace({
  title,
  subtitle,
  badge,
  panel,
  children,
}: DocWorkspaceProps) {
  return (
    <div className="page-enter">
      <header className="flex items-start justify-between gap-3 mb-6">
        <div className="min-w-0">
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight">{title}</h1>
          <p className="text-sm text-[var(--color-text2)] mt-0.5">{subtitle}</p>
        </div>
        {badge}
      </header>

      <div className="max-w-3xl mx-auto space-y-5">
        {children}
        {panel}
      </div>
    </div>
  )
}