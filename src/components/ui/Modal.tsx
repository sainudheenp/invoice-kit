import { type ReactNode } from 'react'

interface ModalProps {
  open: boolean
  onClose?: () => void
  children: ReactNode
  maxW?: string
}

export function Modal({ open, onClose, children, maxW = '420px' }: ModalProps) {
  if (!open) return null
  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div
        className="bg-[var(--color-card)] border border-[var(--color-border)] rounded-2xl shadow-[var(--shadow-pop)] p-6 mx-4 w-full animate-[modalIn_0.2s_ease]"
        style={{ maxWidth: maxW }}
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  )
}