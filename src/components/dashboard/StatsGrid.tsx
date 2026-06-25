import { useApp } from '@/store/AppContext'
import { Svg } from '@/icons'

export function StatsGrid() {
  const { state } = useApp()
  const co = state.companies.find((c) => c.id === state.activeId)
  const invCount = state.invoices.filter((i) => i.companyId === co?.id).length
  const recCount = state.receipts.filter((r) => r.companyId === co?.id).length

  const stats = [
    { icon: 'building', label: 'Companies', value: state.companies.length, bar: 'bg-indigo-500' },
    { icon: 'file', label: 'Invoices', value: invCount, bar: 'bg-[var(--color-primary)]' },
    { icon: 'receipt', label: 'Receipts', value: recCount, bar: 'bg-green' },
  ]

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
      {stats.map((s) => (
        <div key={s.label} className="bg-[var(--color-card)] border border-[var(--color-border)] rounded-2xl shadow-sm overflow-hidden">
          <div className="p-5 flex items-center gap-4">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${s.bar} text-white`}>
              <Svg name={s.icon} />
            </div>
            <div>
              <div className="text-2xl font-bold">{s.value}</div>
              <div className="text-xs text-[var(--color-text2)]">{s.label}</div>
            </div>
          </div>
          <div className={`h-1 ${s.bar}`} />
        </div>
      ))}
    </div>
  )
}
