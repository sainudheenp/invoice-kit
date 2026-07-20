import { useUI } from '@/store/UIContext'

export function PDFOverlay() {
  const { ui } = useUI()
  if (!ui.pdfOverlay) return null
  return (
    <div
      className="fixed inset-0 z-[9998] flex items-center justify-center bg-black/40 backdrop-blur-sm animate-[fadeIn_0.2s_ease]"
      role="alert"
      aria-busy="true"
      aria-live="assertive"
    >
      <div className="bg-[var(--color-card)] rounded-2xl px-10 py-8 flex flex-col items-center gap-4 shadow-2xl border border-[var(--color-border)]">
        <div className="spinner" />
        <div className="text-center">
          <p className="text-sm font-semibold text-[var(--color-text)]">Generating PDF…</p>
          <p className="text-xs text-[var(--color-text2)] mt-1">Please wait, this may take a moment.</p>
        </div>
      </div>
    </div>
  )
}
