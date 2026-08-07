import { type ReactNode } from 'react'
import { Svg } from '@/icons'

interface DocWorkspaceProps {
  title: string
  subtitle: string
  badge?: ReactNode
  panel: ReactNode
  children: ReactNode
}

export function SectionTitle({ icon, children }: { icon: string; children: ReactNode }) {
  return (
    <h3 className="flex items-center gap-2 text-sm font-semibold">
      <span className="w-6 h-6 rounded-lg bg-[var(--color-primary-bg)] text-[var(--color-primary)] flex items-center justify-center">
        <Svg name={icon} className="w-3.5 h-3.5" />
      </span>
      {children}
    </h3>
  )
}

export function DocWorkspace({
  title,
  subtitle,
  badge,
  panel,
  children,
}: DocWorkspaceProps) {
  return (
    <div className="page-enter flex flex-col gap-4 lg:h-[calc(100dvh-2.5rem)] lg:min-h-0">
      <header className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight">{title}</h1>
          <p className="text-sm text-[var(--color-text2)] mt-0.5">{subtitle}</p>
        </div>
        {badge}
      </header>

      {/* Top action bar: totals + save/export */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch">
        {panel}
      </div>

      {/* Full-width form */}
      <div className="min-h-0 flex-1 lg:overflow-y-auto lg:pr-1">
        {children}
      </div>
    </div>
  )
}