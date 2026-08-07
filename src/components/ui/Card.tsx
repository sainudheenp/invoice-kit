import { type ReactNode } from 'react'

interface CardProps {
  children: ReactNode
  className?: string
  id?: string
  hover?: boolean
}

export function Card({ children, className = '', id, hover = false }: CardProps) {
  return (
    <div id={id} className={`surface ${hover ? 'surface-hover' : ''} ${className}`}>
      {children}
    </div>
  )
}

export function CardHeader({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <div className={`px-5 sm:px-6 py-4 border-b border-[var(--color-border)] flex items-center justify-between gap-3 ${className}`}>
      {children}
    </div>
  )
}

export function CardBody({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <div className={`p-4 sm:p-5 ${className}`}>
      {children}
    </div>
  )
}
