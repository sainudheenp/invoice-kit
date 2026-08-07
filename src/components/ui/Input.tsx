import { type InputHTMLAttributes, type TextareaHTMLAttributes } from 'react'

const baseClass = 'w-full px-3.5 py-2.5 rounded-xl border border-[var(--color-input-border)] bg-[var(--color-input-bg)] text-sm text-[var(--color-text)] placeholder:text-[var(--color-text3)] outline-none transition-all duration-150 focus:border-[var(--color-primary)] focus:bg-[var(--color-card)] focus:ring-2 focus:ring-[var(--color-primary-ring)]'
const denseClass = 'w-full px-2.5 py-1.5 rounded-lg border border-[var(--color-input-border)] bg-[var(--color-input-bg)] text-[13px] text-[var(--color-text)] placeholder:text-[var(--color-text3)] outline-none transition-all duration-150 focus:border-[var(--color-primary)] focus:bg-[var(--color-card)] focus:ring-2 focus:ring-[var(--color-primary-ring)]'

interface FieldProps {
  label: string
  required?: boolean
  children: React.ReactNode
  error?: string
  dense?: boolean
}

export function Field({ label, required, children, error, dense }: FieldProps) {
  return (
    <div>
      <label className={`font-semibold text-[var(--color-text2)] block ${dense ? 'text-[11px] mb-0.5' : 'text-xs mb-1.5'}`}>
        {label}
        {required && <span className="text-red"> *</span>}
      </label>
      {children}
      {error && <p className="text-xs text-red mt-1.5 flex items-center gap-1">⚠ {error}</p>}
    </div>
  )
}

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  readOnly?: boolean
  dense?: boolean
}

export function Input({ className = '', readOnly, dense, ...props }: InputProps) {
  const cls = dense ? denseClass : baseClass
  return (
    <input
      className={`${cls} ${readOnly ? 'opacity-80 cursor-default' : ''} ${className}`}
      readOnly={readOnly}
      {...props}
    />
  )
}

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  readOnly?: boolean
  dense?: boolean
}

export function Textarea({ className = '', readOnly, dense, ...props }: TextareaProps) {
  return (
    <textarea
      className={`${dense ? denseClass : baseClass} resize-none ${className}`}
      readOnly={readOnly}
      {...props}
    />
  )
}

interface SelectProps extends InputHTMLAttributes<HTMLSelectElement> {
  children: React.ReactNode
  dense?: boolean
}

export function Select({ className = '', children, dense, ...props }: SelectProps) {
  return (
    <select
      className={`${dense ? denseClass : baseClass} cursor-pointer ${className}`}
      {...props}
    >
      {children}
    </select>
  )
}