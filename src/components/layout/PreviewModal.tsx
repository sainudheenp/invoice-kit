import { useUI } from '@/store/UIContext'

export function PreviewModal() {
  const { ui, closePreview } = useUI()
  if (!ui.previewModal) return null
  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-[var(--color-text)]/40 backdrop-blur-sm p-2 sm:p-4 overflow-y-auto"
      onClick={closePreview}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="bg-[var(--color-card)] rounded-2xl shadow-lg w-full flex flex-col overflow-hidden my-auto max-h-[92dvh] sm:max-h-[90vh] mx-auto"
        style={{ maxWidth: 'min(900px, calc(100vw - 1rem))' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-4 sm:px-5 py-3 border-b border-[var(--color-border)] shrink-0">
          <h3 className="text-sm font-semibold">Document Preview</h3>
          <button
            onClick={closePreview}
            className="w-8 h-8 sm:w-7 sm:h-7 flex items-center justify-center rounded-lg hover:bg-[var(--color-border)] cursor-pointer text-sm shrink-0"
            aria-label="Close preview"
          >
            ✕
          </button>
        </div>
        <div className="flex-1 overflow-auto bg-[var(--color-card)] min-h-0">
          <iframe
            srcDoc={ui.previewContent}
            className="w-full block"
            style={{ height: '70dvh', minHeight: 320 }}
            title="Preview"
          />
        </div>
      </div>
    </div>
  )
}
