import { useUI } from '@/store/UIContext'

export function PreviewModal() {
  const { ui, closePreview } = useUI()
  if (!ui.previewModal) return null
  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40" onClick={closePreview}>
      <div
        className="bg-[var(--color-card)] rounded-2xl shadow-lg mx-4 w-full flex flex-col overflow-hidden"
        style={{ maxWidth: 900, maxHeight: '90vh' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 py-3 border-b border-[var(--color-border)]">
          <h3 className="text-sm font-semibold">Document Preview</h3>
          <button
            onClick={closePreview}
            className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-[var(--color-border)] cursor-pointer text-sm"
          >
            ✕
          </button>
        </div>
        <div className="flex-1 overflow-auto bg-white">
          <iframe
            srcDoc={ui.previewContent}
            className="w-full h-full"
            style={{ minHeight: '70vh' }}
            title="Preview"
          />
        </div>
      </div>
    </div>
  )
}
