import { useLocation, useNavigate } from 'react-router-dom'
import { useUI } from '@/store/UIContext'
import { useApp } from '@/store/AppContext'
import { Svg } from '@/icons'

const NAV_ITEMS = [
  { page: 'dashboard', label: 'Dashboard', icon: 'dashboard' },
  { page: 'invoice', label: 'Invoice', icon: 'file' },
  { page: 'receipt', label: 'Receipt', icon: 'receipt' },
  { page: 'quotation', label: 'Quotation', icon: 'file' },
  { page: 'history', label: 'Documents', icon: 'clipboard' },
  { page: 'settings', label: 'Settings', icon: 'settings' },
] as const

export function Sidebar() {
  const location = useLocation()
  const navigate = useNavigate()
  const { ui, toggleSidebar, closeSidebar } = useUI()
  const { state } = useApp()
  const co = state.companies.find((c) => c.id === state.activeId)

  const current = location.pathname.slice(1) || 'dashboard'

  const goTo = (page: string) => {
    navigate('/' + (page === 'dashboard' ? '' : page))
    closeSidebar()
  }

  return (
    <>
      <aside className={`fixed top-0 left-0 h-full w-[232px] bg-[var(--color-side-bg)] flex flex-col z-50 transition-transform duration-300 max-md:-translate-x-full max-md:shadow-lg ${ui.sidebarOpen ? 'max-md:translate-x-0' : ''}`}>
        <div className="flex items-center gap-2 px-5 h-16 border-b border-white/5 shrink-0">
          <Svg name="receipt" className="text-[var(--color-primary)]" />
          <span className="text-base font-bold text-white/90">invoice<span className="text-[var(--color-primary)]">kit</span></span>
        </div>

        <nav className="flex-1 p-3 space-y-1">
          {NAV_ITEMS.map(({ page, label, icon }) => (
            <button
              key={page}
              onClick={() => goTo(page)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-150 cursor-pointer ${
                current === page
                  ? 'bg-[var(--color-side-active)] text-[var(--color-side-active)] font-medium'
                  : 'text-[var(--color-side-text)] hover:bg-[var(--color-side-hover)] hover:text-white'
              }`}
            >
              <Svg name={icon} className="shrink-0" />
              <span>{label}</span>
            </button>
          ))}
        </nav>

        <div className="p-3 border-t border-white/5">
          <div className="flex items-center gap-2 px-3 py-2 text-xs text-[var(--color-side-text)]">
            <span className="w-2 h-2 rounded-full bg-green shrink-0" />
            <span className="truncate">{co?.name || 'No company'}</span>
          </div>
        </div>
      </aside>

      {ui.sidebarOpen && (
        <div className="fixed inset-0 bg-black/40 z-40 md:hidden" onClick={closeSidebar} />
      )}
    </>
  )
}
