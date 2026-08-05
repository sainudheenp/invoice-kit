import { useLocation, useNavigate } from 'react-router-dom'
import { useUI } from '@/store/UIContext'
import { useApp } from '@/store/AppContext'
import { Svg } from '@/icons'

interface NavGroup {
  label: string
  items: Array<{ page: string; label: string; icon: string }>
}

const NAV_GROUPS: NavGroup[] = [
  {
    label: 'Overview',
    items: [{ page: 'dashboard', label: 'Dashboard', icon: 'dashboard' }],
  },
  {
    label: 'Create',
    items: [
      { page: 'invoice', label: 'Invoice', icon: 'file' },
      { page: 'receipt', label: 'Receipt', icon: 'receipt' },
      { page: 'quotation', label: 'Quotation', icon: 'folder' },
    ],
  },
  {
    label: 'Manage',
    items: [
      { page: 'customers', label: 'Customers', icon: 'users' },
      { page: 'products', label: 'Products', icon: 'box' },
      { page: 'history', label: 'Documents', icon: 'clipboard' },
    ],
  },
  {
    label: 'System',
    items: [{ page: 'settings', label: 'Settings', icon: 'settings' }],
  },
]

export function Sidebar() {
  const location = useLocation()
  const navigate = useNavigate()
  const { ui, closeSidebar, toggleDark } = useUI()
  const { state } = useApp()
  const co = state.companies.find((c) => c.id === state.activeId)

  const current = location.pathname.slice(1) || 'dashboard'

  const goTo = (page: string) => {
    navigate('/' + (page === 'dashboard' ? '' : page))
    closeSidebar()
  }

  return (
    <>
      <aside className={`fixed top-0 left-0 h-full w-[248px] bg-[var(--color-side-bg)] flex flex-col z-50 transition-transform duration-300 max-md:-translate-x-full max-md:shadow-[var(--shadow-pop)] ${ui.sidebarOpen ? 'max-md:translate-x-0' : ''}`}>
        <div className="flex items-center gap-2.5 px-5 h-16 border-b border-white/5 shrink-0">
          <span className="w-9 h-9 rounded-xl bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-primary-dark)] flex items-center justify-center shadow-lg shadow-[var(--color-primary)]/30">
            <Svg name="receipt" className="text-white" />
          </span>
          <span className="text-base font-bold text-white/90 tracking-tight">invoice<span className="text-[var(--color-primary)]">kit</span></span>
        </div>

        <nav className="flex-1 p-3 overflow-y-auto space-y-5">
          {NAV_GROUPS.map((group) => (
            <div key={group.label}>
              <div className="px-3 pb-1.5 text-[10px] font-semibold uppercase tracking-widest text-white/30">
                {group.label}
              </div>
              <div className="space-y-0.5">
                {group.items.map(({ page, label, icon }) => {
                  const active = current === page
                  return (
                    <button
                      key={page}
                      onClick={() => goTo(page)}
                      className={`relative w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all duration-150 cursor-pointer ${
                        active
                          ? 'bg-[var(--color-side-active)] text-white font-semibold'
                          : 'text-[var(--color-side-text)] hover:bg-[var(--color-side-hover)] hover:text-white'
                      }`}
                    >
                      {active && (
                        <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 rounded-r-full bg-[var(--color-primary)]" />
                      )}
                      <span className={`shrink-0 transition-colors ${active ? 'text-[var(--color-primary)]' : ''}`}>
                        <Svg name={icon} />
                      </span>
                      <span>{label}</span>
                      {(page === 'invoice' || page === 'receipt' || page === 'quotation') && (
                        <span className="ml-auto w-1.5 h-1.5 rounded-full bg-[var(--color-primary)]/60" />
                      )}
                    </button>
                  )
                })}
              </div>
            </div>
          ))}
        </nav>

        <div className="p-3 border-t border-white/5 space-y-2">
          {/* Dark mode toggle */}
          <button
            onClick={toggleDark}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm text-[var(--color-side-text)] hover:bg-[var(--color-side-hover)] hover:text-white transition-colors cursor-pointer"
          >
            <span className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-[var(--color-primary)]">
              <Svg name={ui.dark ? 'sun' : 'moon'} />
            </span>
            <span className="flex-1 text-left">{ui.dark ? 'Light Mode' : 'Dark Mode'}</span>
          </button>

          {/* Company card */}
          <button
            onClick={() => goTo('settings')}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 transition-colors cursor-pointer"
          >
            <span className="w-8 h-8 rounded-lg bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-primary-dark)] text-white text-sm font-bold flex items-center justify-center shrink-0">
              {(co?.name || '?').trim().charAt(0).toUpperCase()}
            </span>
            <span className="min-w-0 text-left">
              <span className="block text-xs font-semibold text-white/90 truncate">{co?.name || 'No company'}</span>
              <span className="block text-[10px] text-[var(--color-side-text)]/60">
                v{import.meta.env.VITE_APP_VERSION || '1.00'} &middot; Zain Labs
              </span>
            </span>
          </button>
        </div>
      </aside>

      {ui.sidebarOpen && (
        <div className="fixed inset-0 bg-black/40 z-40 md:hidden" onClick={closeSidebar} />
      )}
    </>
  )
}