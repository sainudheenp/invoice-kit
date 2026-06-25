import { useNavigate } from 'react-router-dom'
import { Svg } from '@/icons'

const ACTIONS = [
  { page: 'invoice', label: 'New Invoice', sub: 'Create a tax invoice', icon: 'file' },
  { page: 'receipt', label: 'New Receipt', sub: 'Create a receipt voucher', icon: 'receipt' },
  { page: 'quotation', label: 'New Quotation', sub: 'Create a quotation', icon: 'file' },
  { page: 'settings', label: 'Settings', sub: 'Manage your company', icon: 'settings' },
]

export function QuickActions() {
  const navigate = useNavigate()
  return (
    <div className="bg-[var(--color-card)] border border-[var(--color-border)] rounded-2xl shadow-sm p-5 mb-6">
      <h2 className="text-sm font-semibold mb-4">Quick Actions</h2>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {ACTIONS.map((a) => (
          <button
            key={a.page}
            onClick={() => navigate('/' + (a.page === 'dashboard' ? '' : a.page))}
            className="flex items-center gap-3 p-4 rounded-xl border border-[var(--color-border)] bg-[var(--color-input-bg)] hover:border-[var(--color-primary)] transition-colors cursor-pointer text-left"
          >
            <div className="w-9 h-9 rounded-lg bg-[var(--color-primary-bg)] text-[var(--color-primary)] flex items-center justify-center">
              <Svg name={a.icon} />
            </div>
            <div>
              <div className="text-sm font-medium">{a.label}</div>
              <div className="text-xs text-[var(--color-text3)]">{a.sub}</div>
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}
