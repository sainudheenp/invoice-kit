import { useApp } from '@/store/AppContext'
import { Svg } from '@/icons'

const STATS = [
  {
    icon: 'building', label: 'Companies',
    color: '#6366f1', bg: 'bg-indigo-100 dark:bg-indigo-900/30', text: 'text-indigo-600 dark:text-indigo-400',
    get: (state: ReturnType<typeof useApp>['state'], _coId: string | null) => state.companies.length,
  },
  {
    icon: 'file', label: 'Invoices',
    color: '#f59e0b', bg: 'bg-amber-100 dark:bg-amber-900/30', text: 'text-amber-600 dark:text-amber-400',
    get: (state: any, coId: string | null) => state.invoices.filter((i: any) => i.companyId === coId).length,
  },
  {
    icon: 'receipt', label: 'Receipts',
    color: '#10b981', bg: 'bg-emerald-100 dark:bg-emerald-900/30', text: 'text-emerald-600 dark:text-emerald-400',
    get: (state: any, coId: string | null) => state.receipts.filter((r: any) => r.companyId === coId).length,
  },
  {
    icon: 'clipboard', label: 'Quotations',
    color: '#3b82f6', bg: 'bg-blue-100 dark:bg-blue-900/30', text: 'text-blue-600 dark:text-blue-400',
    get: (state: any, coId: string | null) => state.quotations.filter((q: any) => q.companyId === coId).length,
  },
]

export function StatsGrid() {
  const { state } = useApp()
  const coId = state.activeId

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-6">
      {STATS.map((s) => (
        <div
          key={s.label}
          className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-card)] p-5 hover:shadow-md transition-shadow"
        >
          <div className="flex items-center justify-between mb-4">
            <div className={`w-11 h-11 rounded-xl ${s.bg} ${s.text} flex items-center justify-center`}>
              <Svg name={s.icon} />
            </div>
            <span className="text-3xl font-bold tracking-tight">{s.get(state, coId)}</span>
          </div>
          <div className="text-sm font-medium text-[var(--color-text2)]">{s.label}</div>
        </div>
      ))}
    </div>
  )
}
