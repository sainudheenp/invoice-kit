import { useNavigate } from 'react-router-dom'
import { useApp } from '@/store/AppContext'
import { Svg } from '@/icons'

const CREATE_ACTIONS = [
  { page: 'invoice', label: 'New Invoice', icon: 'file', primary: true },
  { page: 'receipt', label: 'New Receipt', icon: 'receipt', primary: false },
  { page: 'quotation', label: 'New Quotation', icon: 'folder', primary: false },
]

function greeting() {
  const h = new Date().getHours()
  if (h < 12) return 'Good morning'
  if (h < 17) return 'Good afternoon'
  return 'Good evening'
}

export function HeroBanner() {
  const navigate = useNavigate()
  const { state } = useApp()
  const co = state.companies.find((c) => c.id === state.activeId)

  return (
    <div className="relative overflow-hidden rounded-3xl bg-[var(--color-hero-bg)] text-white p-6 md:p-8 mb-6 shadow-[var(--shadow-card)]">
      {/* Decorative glows */}
      <div className="absolute -top-28 -right-20 w-80 h-80 rounded-full bg-[var(--color-primary)]/25 blur-3xl" />
      <div className="absolute -bottom-32 -left-20 w-80 h-80 rounded-full bg-[var(--color-primary)]/10 blur-3xl" />
      <div className="absolute top-6 right-10 text-white/5 hidden md:block">
        <Svg name="receipt" className="w-40 h-40" />
      </div>

      <div className="relative">
        <div className="text-[11px] font-semibold uppercase tracking-widest text-[var(--color-primary)] mb-2">
          {co?.name || 'invoicekit'}
        </div>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
          {greeting()}, {co ? co.name.split(' ')[0] : 'friend'} 👋
        </h1>
        <p className="text-sm text-white/60 mt-1 max-w-lg">
          {co?.sub || 'Create and send professional documents in seconds.'}
        </p>

        <div className="flex flex-wrap gap-3 mt-6">
          {CREATE_ACTIONS.map((a) => (
            <button
              key={a.page}
              onClick={() => navigate('/' + a.page)}
              className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold transition-all duration-150 cursor-pointer active:scale-[0.98] ${
                a.primary
                  ? 'bg-[var(--color-primary)] text-white shadow-lg shadow-[var(--color-primary)]/40 hover:bg-[var(--color-primary-dark)]'
                  : 'bg-white/10 text-white/90 border border-white/15 hover:bg-white/20'
              }`}
            >
              <Svg name={a.icon} className="w-4 h-4" />
              {a.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}