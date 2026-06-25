import { useUI } from '@/store/UIContext'

const typeStyles: Record<string, string> = {
  ok: 'border-green bg-green-bg text-green-dark',
  err: 'border-red bg-red-bg text-red',
  info: 'border-blue bg-blue-50 text-blue',
}

export function ToastContainer() {
  const { ui } = useUI()
  if (ui.toasts.length === 0) return null
  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[99999] flex flex-col gap-2">
      {ui.toasts.map((t) => (
        <div
          key={t.id}
          className={`px-5 py-3 rounded-xl border shadow-lg text-sm font-medium animate-[fadeIn_0.25s_ease] ${typeStyles[t.type] || typeStyles.ok}`}
        >
          <div className="flex items-center gap-2">
            {t.type === 'ok' && (
              <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
            )}
            {t.type === 'err' && (
              <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            )}
            {t.type === 'info' && (
              <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/>
              </svg>
            )}
            {t.msg}
          </div>
        </div>
      ))}
    </div>
  )
}
