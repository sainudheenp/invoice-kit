import { type ReactNode, type ButtonHTMLAttributes } from 'react'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'success' | 'danger' | 'info' | 'orange' | 'outline' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  children: ReactNode
}

const variants: Record<string, string> = {
  primary: 'bg-[var(--color-primary)] text-white hover:bg-[var(--color-primary-dark)] shadow-sm shadow-[var(--color-primary)]/30',
  success: 'bg-green text-white hover:bg-green-dark',
  danger: 'bg-red text-white hover:brightness-110',
  info: 'bg-blue text-white hover:brightness-110',
  orange: 'bg-[var(--color-primary)] text-white hover:bg-[var(--color-primary-dark)]',
  outline: 'border border-[var(--color-border)] bg-[var(--color-card)] text-[var(--color-text)] hover:border-[var(--color-primary)] hover:text-[var(--color-primary)] hover:bg-[var(--color-primary-bg)]',
  ghost: 'bg-transparent hover:bg-[var(--color-input-bg)] text-[var(--color-text2)] hover:text-[var(--color-text)] border-0',
}

const sizeClass: Record<string, string> = {
  sm: 'px-3 py-1.5 text-xs',
  md: 'px-4 py-2 text-sm',
  lg: 'px-6 py-3 text-sm font-semibold',
}

export function Button({ variant = 'primary', size = 'md', children, className = '', ...props }: ButtonProps) {
  return (
    <button
      className={`inline-flex items-center justify-center gap-1.5 font-medium rounded-full cursor-pointer transition-all duration-150 border border-transparent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-card)] active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none ${variants[variant]} ${sizeClass[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  )
}