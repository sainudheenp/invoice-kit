import { useEffect, useRef, useState } from 'react'
import { useUI } from '@/store/UIContext'

const STEPS = [
  { id: 'header', label: 'Adding header' },
  { id: 'items', label: 'Adding items' },
  { id: 'qr', label: 'Generating QR' },
  { id: 'signature', label: 'Signing document' },
  { id: 'seal', label: 'Punching seal' },
  { id: 'done', label: 'Done!' },
]

export function PDFOverlay() {
  const { ui } = useUI()
  const active = ui.pdfOverlay
  const [currentStep, setCurrentStep] = useState(0)
  const [visible, setVisible] = useState(false)
  const activeRef = useRef(active)
  activeRef.current = active
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const cleanup = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current)
      closeTimerRef.current = null
    }
  }

  useEffect(() => {
    if (active) {
      cleanup()
      setVisible(true)
      setCurrentStep(0)

      let step = 0
      timerRef.current = setInterval(() => {
        step += 1
        if (step < 5) {
          setCurrentStep(step)
        } else {
          // Reached step 4 (Punching seal)
          if (!activeRef.current) {
            setCurrentStep(5)
            if (timerRef.current) {
              clearInterval(timerRef.current)
              timerRef.current = null
            }
            closeTimerRef.current = setTimeout(() => {
              setVisible(false)
              setCurrentStep(0)
            }, 600)
          } else {
            setCurrentStep(4)
          }
        }
      }, 320)

      return cleanup
    } else {
      // active turned false
      if (visible && currentStep >= 4) {
        setCurrentStep(5)
        if (timerRef.current) {
          clearInterval(timerRef.current)
          timerRef.current = null
        }
        closeTimerRef.current = setTimeout(() => {
          setVisible(false)
          setCurrentStep(0)
        }, 600)
      }
    }
  }, [active])

  useEffect(() => cleanup, [])

  if (!visible) return null

  const isDone = currentStep >= 5
  const progressPercent = isDone ? 100 : Math.min(95, Math.round(((currentStep + 1) / STEPS.length) * 100))

  return (
    <div
      className="fixed inset-0 z-[9998] flex items-center justify-center bg-black/60 backdrop-blur-md animate-[fadeIn_0.2s_ease]"
      role="alert"
      aria-busy={active}
      aria-live="assertive"
    >
      <div className="bg-[var(--color-card)] rounded-2xl p-7 w-[360px] max-w-[90vw] flex flex-col items-center gap-5 shadow-2xl border border-[var(--color-border)]">
        {/* Document Icon / Badge */}
        <div className="relative w-14 h-14 rounded-2xl bg-[var(--color-primary-bg,#fef3c7)] flex items-center justify-center shadow-sm">
          {isDone ? (
            <svg className="w-8 h-8 text-[var(--color-primary,#D97706)] animate-[bounce_0.5s_ease]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          ) : (
            <svg className="w-7 h-7 text-[var(--color-primary,#D97706)] animate-pulse" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="16" y1="13" x2="8" y2="13" />
              <line x1="16" y1="17" x2="8" y2="17" />
            </svg>
          )}
        </div>

        {/* Title */}
        <div className="text-center">
          <h3 className="text-base font-bold text-[var(--color-text)]">
            {isDone ? 'PDF Ready!' : 'Generating Document'}
          </h3>
          <p className="text-xs text-[var(--color-text2)] mt-1">
            {isDone ? 'Your download is starting now.' : 'Building invoice vector structure...'}
          </p>
        </div>

        {/* Progress Bar */}
        <div className="w-full h-1.5 rounded-full bg-[var(--color-border)] overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-300 ease-out"
            style={{
              width: `${progressPercent}%`,
              background: 'linear-gradient(90deg, var(--color-primary, #D97706), #f59e0b)',
            }}
          />
        </div>

        {/* Step Flow List */}
        <div className="w-full bg-[var(--color-input-bg,#f8fafc)] rounded-xl p-3.5 border border-[var(--color-border)] space-y-2.5">
          {STEPS.map((step, idx) => {
            const isFinished = currentStep > idx || isDone
            const isCurrent = currentStep === idx && !isDone

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
                  {/* Status Indicator */}
                  {isFinished ? (
                    <span className="w-4 h-4 rounded-full bg-emerald-500/20 text-emerald-600 flex items-center justify-center text-[10px] font-bold">
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
                {isFinished && (
                  <span className="text-[10px] text-emerald-600 font-medium">Done</span>
                )}
              </div>
            )
          })}
        </div>

        {/* Branding */}
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