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
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-[var(--color-text)]/50 backdrop-blur-sm p-3 sm:p-4 overflow-y-auto overflow-x-hidden"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      {/* spacer for vertical centering with scroll */}
      <div className="my-auto w-full flex justify-center py-4">
        <div
          className="bg-[var(--color-card)] border border-[var(--color-border)] rounded-2xl shadow-[var(--shadow-pop)] w-full max-h-[90dvh] overflow-y-auto overscroll-contain p-4 sm:p-6 animate-[modalIn_0.2s_ease] mx-auto"
          style={{ maxWidth: `min(${maxW}, calc(100vw - 1.5rem))` }}
          onClick={(e) => e.stopPropagation()}
        >
          {children}
        </div>
      </div>
    </div>
  )
}