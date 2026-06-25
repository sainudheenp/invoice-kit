import { type ReactNode } from 'react'

interface CardProps {
  children: ReactNode
  className?: string
  id?: string
}

export function Card({ children, className = '', id }: CardProps) {
  return (
    <div id={id} className={`bg-[var(--color-card)] border border-[var(--color-border)] rounded-2xl shadow-sm ${className}`}>
      {children}
    </div>
  )
}

export function CardHeader({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <div className={`px-6 py-4 border-b border-[var(--color-border)] flex items-center justify-between gap-3 ${className}`}>
      {children}
    </div>
  )
}
