import { type ReactNode, type ButtonHTMLAttributes } from 'react'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'success' | 'danger' | 'info' | 'orange' | 'outline' | 'ghost'
  size?: 'sm' | 'md'
  children: ReactNode
}

const variants: Record<string, string> = {
  primary: 'bg-[var(--color-primary)] text-white hover:brightness-110',
  success: 'bg-green text-white hover:bg-green-dark',
  danger: 'bg-red text-white hover:brightness-110',
  info: 'bg-blue text-white hover:brightness-110',
  orange: 'bg-[var(--color-primary)] text-white',
  outline: 'border border-[var(--color-border)] bg-transparent hover:bg-[var(--color-input-bg)]',
  ghost: 'bg-transparent hover:bg-[var(--color-input-bg)] border-0',
}

export function Button({ variant = 'primary', size = 'md', children, className = '', ...props }: ButtonProps) {
  const sizeClass = size === 'sm' ? 'px-3 py-1.5 text-xs' : 'px-4 py-2 text-sm'
  return (
    <button
      className={`inline-flex items-center gap-1.5 font-medium rounded-full cursor-pointer transition-all duration-150 border border-transparent disabled:opacity-50 disabled:cursor-not-allowed ${variants[variant]} ${sizeClass} ${className}`}
      {...props}
    >
      {children}
    </button>
  )
}
