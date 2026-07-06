import { type InputHTMLAttributes, type TextareaHTMLAttributes } from 'react'

const baseClass = 'w-full px-3 py-2 rounded-lg border border-[var(--color-input-border)] bg-[var(--color-input-bg)] text-sm outline-none focus:ring-2 focus:ring-[var(--color-primary-ring)]'

interface FieldProps {
  label: string
  required?: boolean
  children: React.ReactNode
  error?: string
}

export function Field({ label, required, children, error }: FieldProps) {
  return (
    <div>
      <label className="text-xs font-medium text-[var(--color-text2)]">
        {label}
        {required && <span className="text-red"> *</span>}
      </label>
      {children}
      {error && <p className="text-xs text-red mt-1">{error}</p>}
    </div>
  )
}

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  readOnly?: boolean
}

export function Input({ className = '', readOnly, ...props }: InputProps) {
  return (
    <input
      className={`${baseClass} ${readOnly ? '' : ''} ${className}`}
      readOnly={readOnly}
      {...props}
    />
  )
}

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  readOnly?: boolean
}

export function Textarea({ className = '', readOnly, ...props }: TextareaProps) {
  return (
    <textarea
      className={`${baseClass} resize-none ${className}`}
      readOnly={readOnly}
      {...props}
    />
  )
}

interface SelectProps extends InputHTMLAttributes<HTMLSelectElement> {
  children: React.ReactNode
}

export function Select({ className = '', children, ...props }: SelectProps) {
  return (
    <select
      className={`${baseClass} cursor-pointer ${className}`}
      {...props}
    >
      {children}
    </select>
  )
}
