import { useApp } from '@/store/AppContext'
import { Svg } from '@/icons'
import { dp as getDp } from '@/utils'

export function StatsGrid() {
  const { state } = useApp()
  const coId = state.activeId
  const co = state.companies.find((c) => c.id === coId)
  const curSymbol = co?.currency.symbol || ''
  const decimals = co?.currency.subPer ? getDp(co.currency.subPer) : 2

  const activeInvoices = state.invoices.filter((i) => i.companyId === coId)
  const activeReceipts = state.receipts.filter((r) => r.companyId === coId)

  const totalInvoiced = activeInvoices.reduce((sum, item) => sum + item.grand, 0)
  const totalPaid = activeInvoices.filter((i) => i.paid).reduce((sum, item) => sum + item.grand, 0)
  const totalPending = activeInvoices.filter((i) => !i.paid).reduce((sum, item) => sum + item.grand, 0)
  const totalReceipts = activeReceipts.reduce((sum, item) => sum + item.amount, 0)

  const stats = [
    {
      icon: 'file',
      label: 'Total Invoiced',
      value: `${curSymbol}${totalInvoiced.toLocaleString(undefined, { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}`,
      sub: `${activeInvoices.length} Invoices`,
      bg: 'bg-[var(--color-amber-bg)] dark:bg-[var(--color-amber)]/15',
      text: 'text-[var(--color-amber)] dark:text-[var(--color-amber)]',
    },
    {
      icon: 'check',
      label: 'Total Collected',
      value: `${curSymbol}${totalPaid.toLocaleString(undefined, { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}`,
      sub: `${activeInvoices.filter(i => i.paid).length} Paid`,
      bg: 'bg-[var(--color-green-bg)] dark:bg-[var(--color-green)]/15',
      text: 'text-[var(--color-green)] dark:text-[var(--color-green)]',
    },
    {
      icon: 'warning',
      label: 'Pending Invoices',
      value: `${curSymbol}${totalPending.toLocaleString(undefined, { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}`,
      sub: `${activeInvoices.filter(i => !i.paid).length} Unpaid`,
      bg: 'bg-[var(--color-red-bg)] dark:bg-[var(--color-red)]/15',
      text: 'text-[var(--color-red)] dark:text-[var(--color-red)]',
    },
    {
      icon: 'receipt',
      label: 'Receipt Vouchers',
      value: `${curSymbol}${totalReceipts.toLocaleString(undefined, { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}`,
      sub: `${activeReceipts.length} Receipts`,
      bg: 'bg-[var(--color-blue-bg,#EFF6FF)] dark:bg-[var(--color-blue)]/15',
      text: 'text-[var(--color-blue)] dark:text-[var(--color-blue)]',
    },
  ]

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-6">
      {stats.map((s) => (
        <div
          key={s.label}
          className="surface surface-hover p-5"
        >
          <div className="flex items-center justify-between mb-4">
            <div className={`w-11 h-11 rounded-xl ${s.bg} ${s.text} flex items-center justify-center`}>
              <Svg name={s.icon} />
            </div>
            <span className="text-xl font-bold tracking-tight text-[var(--color-text)] truncate max-w-[70%]">{s.value}</span>
          </div>
          <div className="text-sm font-semibold text-[var(--color-text)]">{s.label}</div>
          <div className="text-xs text-[var(--color-text2)] mt-0.5">{s.sub}</div>
        </div>
      ))}
    </div>
  )
}
