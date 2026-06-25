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
          className={`px-5 py-3 rounded-xl border shadow-lg text-sm font-medium animate-[fadeIn_0.3s_ease] ${typeStyles[t.type] || typeStyles.ok}`}
        >
          {t.msg}
        </div>
      ))}
    </div>
  )
}
