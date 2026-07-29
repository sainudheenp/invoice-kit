import { useEffect, useRef, useState } from 'react'
import { useUI } from '@/store/UIContext'

const MIN_VISIBLE_MS = 1200

export function PDFOverlay() {
  const { ui } = useUI()
  const active = ui.pdfOverlay
  const [progress, setProgress] = useState(0)
  const [visible, setVisible] = useState(false)
  const startedAt = useRef(0)
  const timers = useRef<ReturnType<typeof setTimeout>[]>([])

  const clearTimers = () => {
    timers.current.forEach(clearTimeout)
    timers.current = []
  }

  useEffect(() => {
    if (active) {
      clearTimers()
      setVisible(true)
      startedAt.current = Date.now()
      requestAnimationFrame(() => {
        requestAnimationFrame(() => setProgress(85))
      })
      return
    }

    if (!visible) return

    const finish = () => {
      setProgress(100)
      timers.current.push(
        setTimeout(() => {
          setVisible(false)
          setProgress(0)
        }, 450),
      )
    }

    const elapsed = Date.now() - startedAt.current
    const wait = Math.max(0, MIN_VISIBLE_MS - elapsed)
    if (wait === 0) finish()
    else timers.current.push(setTimeout(finish, wait))

    return clearTimers
  }, [active])

  useEffect(() => clearTimers, [])

  if (!visible) return null

  const done = progress >= 100

  return (
    <div
      className="fixed inset-0 z-[9998] flex items-center justify-center bg-black/50 backdrop-blur-sm animate-[fadeIn_0.2s_ease]"
      role="alert"
      aria-busy={active}
      aria-live="assertive"
    >
      <div className="bg-[var(--color-card)] rounded-2xl px-10 py-9 w-[340px] max-w-[86vw] flex flex-col items-center gap-5 shadow-2xl border border-[var(--color-border)]">
        {/* Document icon */}
        <div className="w-14 h-14 rounded-2xl bg-[var(--color-primary-bg, #fef3c7)] flex items-center justify-center">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--color-primary, #D97706)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <polyline points="14 2 14 8 20 8" />
            <line x1="16" y1="13" x2="8" y2="13" />
            <line x1="16" y1="17" x2="8" y2="17" />
            <polyline points="10 9 9 9 8 9" />
          </svg>
        </div>

        <div className="text-center">
          <p className="text-sm font-semibold text-[var(--color-text)]">
            {done ? 'Done!' : 'Generating PDF…'}
          </p>
          <p className="text-xs text-[var(--color-text2)] mt-1.5 leading-relaxed">
            {done
              ? 'Your download is starting.'
              : 'Please hold while we prepare your document.'}
          </p>
        </div>

        {/* Progress bar */}
        <div className="w-full flex flex-col gap-1.5">
          <div className="h-2 w-full rounded-full bg-[var(--color-border)] overflow-hidden">
            <div
              className="h-full rounded-full"
              style={{
                width: `${progress}%`,
                background: 'linear-gradient(90deg, var(--color-primary, #D97706), var(--color-primary, #D97706) 60%, #f59e0b)',
                transition: done
                  ? 'width 0.3s ease-out'
                  : 'width 8s cubic-bezier(0.1, 0.7, 0.1, 1)',
              }}
            />
          </div>
        </div>

        {/* Branding */}
        <div className="text-[10px] text-[var(--color-text3)] pt-1 border-t border-[var(--color-border)] w-full text-center">
          Powered by <a href="http://sainudheen.tech/" target="_blank" rel="noopener noreferrer" className="font-medium hover:text-[var(--color-primary)] transition-colors">Zain Labs</a>
        </div>
      </div>
    </div>
  )
}