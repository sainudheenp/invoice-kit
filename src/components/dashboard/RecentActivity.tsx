import { useNavigate } from 'react-router-dom'
import { useApp } from '@/store/AppContext'
import { Card, CardHeader } from '@/components/ui'
import { Svg } from '@/icons'
import { dp as getDp, invStatus } from '@/utils'

type DocType = 'inv' | 'rec' | 'quot'

interface ActivityItem {
  id: string
  type: DocType
  no: string
  date: string
  client: string
  amount: number
  createdAt: number
  status?: { lbl: string; cls: string }
}

export function RecentActivity() {
  const navigate = useNavigate()
  const { state, setEditing } = useApp()
  const coId = state.activeId
  const co = state.companies.find((c) => c.id === coId)
  
  if (!co) return null

  const decimals = co?.currency.subPer ? getDp(co.currency.subPer) : 2
  const curSymbol = co?.currency.symbol || ''

  // Gather all docs
  const invoicesList: ActivityItem[] = state.invoices
    .filter((i) => i.companyId === coId)
    .map((i) => ({
      id: i.id,
      type: 'inv' as const,
      no: i.invNo,
      date: i.date,
      client: i.customer.name,
      amount: i.grand,
      createdAt: i.createdAt,
      status: invStatus(i),
    }))

  const receiptsList: ActivityItem[] = state.receipts
    .filter((r) => r.companyId === coId)
    .map((r) => ({
      id: r.id,
      type: 'rec' as const,
      no: r.recNo,
      date: r.date,
      client: r.receivedFrom,
      amount: r.amount || r.items.reduce((s, item) => s + item.amount, 0),
      createdAt: r.createdAt,
    }))

  const quotationsList: ActivityItem[] = state.quotations
    .filter((q) => q.companyId === coId)
    .map((q) => ({
      id: q.id,
      type: 'quot' as const,
      no: q.quotNo,
      date: q.date,
      client: q.customer.name,
      amount: q.grand,
      createdAt: q.createdAt,
    }))

  // Merge and sort
  const recentItems = [...invoicesList, ...receiptsList, ...quotationsList]
    .sort((a, b) => b.createdAt - a.createdAt)
    .slice(0, 5)

  const handleEdit = (type: DocType, id: string) => {
    setEditing({ type, id })
    navigate('/' + (type === 'inv' ? 'invoice' : type === 'rec' ? 'receipt' : 'quotation'))
  }

  const getDocTypeLabel = (type: DocType) => {
    switch (type) {
      case 'inv': return { lbl: 'Invoice', cls: 'bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400' }
      case 'rec': return { lbl: 'Receipt', cls: 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' }
      case 'quot': return { lbl: 'Quotation', cls: 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400' }
    }
  }

  return (
    <Card className="mb-6">
      <CardHeader>
        <h2 className="text-sm font-semibold">Recent Documents</h2>
        <button 
          onClick={() => navigate('/history')}
          className="text-xs text-[var(--color-primary)] hover:underline font-medium cursor-pointer"
        >
          View All Documents &rarr;
        </button>
      </CardHeader>
      
      {recentItems.length === 0 ? (
        <div className="p-8 text-center text-[var(--color-text2)]">
          <Svg name="clipboard" className="text-4xl mb-2 text-[var(--color-text3)] block mx-auto" />
          <p className="text-sm font-medium">No documents created yet</p>
          <p className="text-xs text-[var(--color-text3)] mt-1">
            Create invoices, receipts, or quotations to get started.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--color-border)] text-[var(--color-text2)] text-xs">
                <th className="py-3 px-5 text-left">Type</th>
                <th className="py-3 px-5 text-left">Doc No.</th>
                <th className="py-3 px-5 text-left">Client/Party</th>
                <th className="py-3 px-5 text-right">Amount</th>
                <th className="py-3 px-5 text-left">Date</th>
                <th className="py-3 px-5 text-center">Status</th>
                <th className="py-3 px-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {recentItems.map((item) => {
                const typeInfo = getDocTypeLabel(item.type)
                return (
                  <tr key={`${item.type}-${item.id}`} className="border-b border-[var(--color-border)]/50 hover:bg-[var(--color-input-bg)]/50">
                    <td className="py-3 px-5">
                      <span className={`inline-block text-xs px-2.5 py-0.5 rounded-full font-medium ${typeInfo.cls}`}>
                        {typeInfo.lbl}
                      </span>
                    </td>
                    <td className="py-3 px-5 font-semibold text-[var(--color-text)]">
                      {item.no}
                    </td>
                    <td className="py-3 px-5 text-[var(--color-text)] truncate max-w-[150px]">
                      {item.client}
                    </td>
                    <td className="py-3 px-5 text-right font-medium text-[var(--color-text)]">
                      {curSymbol}{item.amount.toLocaleString(undefined, { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}
                    </td>
                    <td className="py-3 px-5 text-xs text-[var(--color-text2)]">
                      {item.date}
                    </td>
                    <td className="py-3 px-5 text-center">
                      {item.status ? (
                        <span className={`inline-block text-xs px-2 py-0.5 rounded-full font-medium
                          ${item.status.cls === 'green' ? 'bg-green-bg text-green-dark' : ''}
                          ${item.status.cls === 'amber' ? 'bg-amber-bg text-amber' : ''}
                        `}>
                          {item.status.lbl}
                        </span>
                      ) : (
                        <span className="text-[var(--color-text3)] text-xs">—</span>
                      )}
                    </td>
                    <td className="py-3 px-5">
                      <div className="flex gap-2 justify-end">
                        <button
                          onClick={() => handleEdit(item.type, item.id)}
                          className="p-1 rounded-lg hover:bg-[var(--color-input-bg)] text-[var(--color-text2)] hover:text-[var(--color-primary)] transition-colors cursor-pointer"
                          title="Edit"
                        >
                          <Svg name="edit" className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </Card>
  )
}
