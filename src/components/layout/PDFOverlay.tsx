import { useUI } from '@/store/UIContext'

export function PDFOverlay() {
  const { ui } = useUI()
  if (!ui.pdfOverlay) return null
  return (
    <div className="fixed inset-0 z-[9998] flex items-center justify-center bg-black/30">
      <div className="bg-[var(--color-card)] rounded-2xl p-8 flex flex-col items-center gap-3 shadow-lg">
        <div className="spinner" />
        <p className="text-sm text-[var(--color-text2)]">Generating PDF...</p>
      </div>
    </div>
  )
}
