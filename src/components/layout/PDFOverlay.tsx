import { useEffect, useRef, useState } from 'react'
import { useUI } from '@/store/UIContext'
import type { PdfPhase } from '@/utils/pdf'

const PHASES: ReadonlyArray<{ id: PdfPhase; label: string }> = [
  { id: 'preparing', label: 'Building document structure' },
  { id: 'fonts', label: 'Loading fonts' },
  { id: 'engine', label: 'Preparing PDF engine' },
  { id: 'rendering', label: 'Rendering pages' },
  { id: 'downloading', label: 'Starting download' },
  { id: 'done', label: 'Done!' },
]

function phaseIndex(phase: PdfPhase): number {
  const idx = PHASES.findIndex(p => p.id === phase)
  return idx >= 0 ? idx : -1
}

export function PDFOverlay() {
  const { ui } = useUI()
  const active = ui.pdfOverlay
  const phase = ui.pdfPhase
  const detail = ui.pdfPhaseDetail
  const [visible, setVisible] = useState(false)
  const activeRef = useRef(active)
  activeRef.current = active
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const cleanup = () => {
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current)
      closeTimerRef.current = null
    }
  }

  useEffect(() => {
    if (active) {
      cleanup()
      setVisible(true)
      return cleanup
    } else {
      if (visible) {
        closeTimerRef.current = setTimeout(() => {
          setVisible(false)
        }, 600)
      }
    }
    return cleanup
  }, [active, phase, visible])

  useEffect(() => cleanup, [])

  if (!visible) return null

  const currentIdx = phaseIndex(phase)
  const isDone = phase === 'done'
  const isError = phase === 'error'
  const isRendering = phase === 'rendering'

  const progressPercent = isDone ? 100 : isError ? Math.min(80, Math.max(10, (currentIdx + 0.5) / PHASES.length * 100)) : Math.min(95, ((currentIdx + 1) / PHASES.length) * 100)

  return (
    <div
      className="fixed inset-0 z-[9998] flex items-center justify-center bg-[var(--color-text)]/60 backdrop-blur-md animate-[fadeIn_0.2s_ease]"
      role="alert"
      aria-busy={active && !isDone}
      aria-live="assertive"
    >
      <div className="bg-[var(--color-card)] rounded-2xl p-7 w-[360px] max-w-[90vw] flex flex-col items-center gap-5 shadow-2xl border border-[var(--color-border)]">
        <div className="relative w-14 h-14 rounded-2xl bg-[var(--color-primary-bg,#fef3c7)] flex items-center justify-center shadow-sm">
          {isDone ? (
            <svg className="w-8 h-8 text-[var(--color-primary,#D97706)] animate-[bounce_0.5s_ease]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          ) : isError ? (
            <svg className="w-8 h-8 text-[var(--color-red)]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
          ) : (
            <svg className={`w-7 h-7 text-[var(--color-primary,#D97706)] ${isRendering ? 'animate-pulse' : ''}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="16" y1="13" x2="8" y2="13" />
              <line x1="16" y1="17" x2="8" y2="17" />
            </svg>
          )}
        </div>

        <div className="text-center">
          <h3 className="text-base font-bold text-[var(--color-text)]">
            {isDone ? 'PDF Ready!' : isError ? 'Export Failed' : 'Generating Document'}
          </h3>
          <p className="text-xs text-[var(--color-text2)] mt-1">
            {isDone ? 'Your download is starting now.' : isError ? 'Falling back to print dialog.' : detail || 'Please wait...'}
          </p>
        </div>

        <div className="w-full h-1.5 rounded-full bg-[var(--color-border)] overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-300 ease-out"
            style={{
              width: `${progressPercent}%`,
              background: isError ? 'linear-gradient(90deg, var(--color-red), #f87171)' : 'linear-gradient(90deg, var(--color-primary, #D97706), #f59e0b)',
            }}
          />
        </div>

        <div className="w-full bg-[var(--color-input-bg,#f8fafc)] rounded-xl p-3.5 border border-[var(--color-border)] space-y-2.5">
          {PHASES.map((step, idx) => {
            const isFinished = currentIdx > idx || isDone
            const isCurrent = currentIdx === idx && !isDone && !isError

            return (
              <div
                key={step.id}
                className={`flex items-center justify-between text-xs px-2 py-1 rounded-lg transition-all duration-200 ${
                  isCurrent
                    ? 'bg-[var(--color-primary-bg,#fef3c7)] font-semibold text-[var(--color-primary,#D97706)]'
                    : isFinished
                      ? 'text-[var(--color-text)] opacity-90'
                      : 'text-[var(--color-text3,#94a3b8)] opacity-60'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  {isFinished ? (
                    <span className="w-4 h-4 rounded-full bg-[var(--color-green)]/15 text-[var(--color-green-dark)] flex items-center justify-center text-[10px] font-bold">
                      ✓
                    </span>
                  ) : isCurrent ? (
                    <span className="w-4 h-4 rounded-full border-2 border-[var(--color-primary,#D97706)] border-t-transparent animate-spin" />
                  ) : (
                    <span className="w-4 h-4 rounded-full border border-[var(--color-border)] flex items-center justify-center text-[9px] text-[var(--color-text3)]">
                      {idx + 1}
                    </span>
                  )}
                  <span>{step.label}</span>
                </div>

                {isCurrent && (
                  <span className="text-[10px] uppercase tracking-wider font-semibold animate-pulse">
                    Processing
                  </span>
                )}
                {isFinished && !isDone && (
                  <span className="text-[10px] text-[var(--color-green-dark)] font-medium">Done</span>
                )}
                {isDone && idx === PHASES.length - 1 && (
                  <span className="text-[10px] text-[var(--color-green-dark)] font-medium">Complete</span>
                )}
              </div>
            )
          })}
        </div>

        <div className="text-[10px] text-[var(--color-text3)] pt-1 border-t border-[var(--color-border)] w-full text-center">
          Powered by{' '}
          <a
            href="http://sainudheen.tech/"
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium hover:text-[var(--color-primary)] transition-colors"
          >
            Zain Labs
          </a>
        </div>
      </div>
    </div>
  )
}
