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
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40"
      onClick={onClose}
    >
      <div
        className="bg-[var(--color-card)] rounded-2xl shadow-lg p-6 mx-4 w-full"
        style={{ maxWidth: maxW }}
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  )
}
