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
        requestAnimationFrame(() => setProgress(90))
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
      className="fixed inset-0 z-[9998] flex items-center justify-center bg-black/40 backdrop-blur-sm animate-[fadeIn_0.2s_ease]"
      role="alert"
      aria-busy={active}
      aria-live="assertive"
    >
      <div className="bg-[var(--color-card)] rounded-2xl px-10 py-8 w-[320px] max-w-[86vw] flex flex-col items-center gap-4 shadow-2xl border border-[var(--color-border)]">
        <div className="text-center">
          <p className="text-sm font-semibold text-[var(--color-text)]">
            {done ? 'Ready' : 'Generating PDF…'}
          </p>
          <p className="text-xs text-[var(--color-text2)] mt-1">
            {done ? 'Your download is starting.' : 'Please wait, this may take a moment.'}
          </p>
        </div>
        <div className="w-full flex flex-col gap-1.5">
          <div className="h-2 w-full rounded-full bg-[var(--color-border)] overflow-hidden">
            <div
              className="h-full rounded-full bg-[var(--color-primary,#D97706)]"
              style={{
                width: `${progress}%`,
                transition: done
                  ? 'width 0.3s ease-out'
                  : 'width 8s cubic-bezier(0.1, 0.7, 0.1, 1)',
              }}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
