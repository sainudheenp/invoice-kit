import { useApp } from '@/store/AppContext'

export function ActiveCompany() {
  const { state } = useApp()
  const co = state.companies.find((c) => c.id === state.activeId)
  if (!co) return null

  return (
    <div className="bg-[var(--color-card)] border border-[var(--color-border)] rounded-2xl shadow-sm overflow-hidden">
      <div className="px-5 py-3 border-b border-[var(--color-border)] flex items-center justify-between">
        <h2 className="text-sm font-semibold">Active Company</h2>
        <span className="text-xs px-2 py-0.5 rounded-full bg-[var(--color-primary-bg)] text-[var(--color-primary)] font-medium">
          {co.currency.code} {co.currency.symbol}
        </span>
      </div>
      <div className="p-5 flex items-start gap-4">
        {co.logo ? (
          <img src={co.logo} alt="" className="w-14 h-14 rounded-xl object-contain border border-[var(--color-border)]" />
        ) : (
          <div className="w-14 h-14 rounded-xl bg-[var(--color-primary-bg)] text-[var(--color-primary)] flex items-center justify-center text-lg font-bold">
            {co.name.charAt(0)}
          </div>
        )}
        <div className="min-w-0">
          <h3 className="font-semibold text-base truncate">{co.name}</h3>
          {co.sub && <p className="text-xs text-[var(--color-text2)] truncate">{co.sub}</p>}
          {(co.tel || co.email || co.loc) && (
            <div className="text-xs text-[var(--color-text3)] mt-1 space-y-0.5">
              {co.tel && <p>📞 {co.tel}</p>}
              {co.email && <p>✉ {co.email}</p>}
              {co.loc && <p>📍 {co.loc}</p>}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
