import { useState } from 'react'
import { useApp } from '@/store/AppContext'
import { useUI } from '@/store/UIContext'
import { Card, Button, Modal } from '@/components/ui'
import { Svg } from '@/icons'
import { uid } from '@/utils/uid'
import type { CustomerRecord } from '@/types/customer'

export default function Customers() {
  const { state, saveCustomerRecord, deleteCustomerRecord } = useApp()
  const { showToast } = useUI()
  const coId = state.activeId

  const [search, setSearch] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [editingCust, setEditingCust] = useState<CustomerRecord | null>(null)

  // Form states
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [address, setAddress] = useState('')
  const [cr, setCr] = useState('')

  const activeCustomers = state.customers.filter((c) => c.companyId === coId)
  const filtered = activeCustomers.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.email.toLowerCase().includes(search.toLowerCase()) ||
    c.phone.includes(search)
  )

  const openAdd = () => {
    setEditingCust(null)
    setName('')
    setEmail('')
    setPhone('')
    setAddress('')
    setCr('')
    setModalOpen(true)
  }

  const openEdit = (c: CustomerRecord) => {
    setEditingCust(c)
    setName(c.name)
    setEmail(c.email)
    setPhone(c.phone)
    setAddress(c.address)
    setCr(c.cr)
    setModalOpen(true)
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!coId) {
      showToast('No active company selected.', 'err')
      return
    }
    if (!name.trim()) {
      showToast('Name is required.', 'err')
      return
    }

    try {
      const record: CustomerRecord = {
        id: editingCust?.id || uid(),
        companyId: coId,
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim(),
        address: address.trim(),
        cr: cr.trim(),
        createdAt: editingCust?.createdAt || Date.now(),
      }
      await saveCustomerRecord(record)
      showToast(editingCust ? 'Customer updated successfully!' : 'Customer added successfully!')
      setModalOpen(false)
    } catch {
      showToast('Failed to save customer.', 'err')
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this customer?')) return
    try {
      await deleteCustomerRecord(id)
      showToast('Customer deleted successfully.')
    } catch {
      showToast('Failed to delete customer.', 'err')
    }
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
        <div>
          <h1 className="text-xl font-bold">Customers</h1>
          <p className="text-sm text-[var(--color-text2)]">Manage customer directory for auto-filling documents.</p>
        </div>
        <Button onClick={openAdd} className="sm:self-center">
          <span className="text-lg leading-none">+</span> Add Customer
        </Button>
      </div>

      <div className="mb-5 flex items-center gap-2 px-3 py-2.5 rounded-xl border border-[var(--color-border)] bg-[var(--color-card)] max-w-md">
        <Svg name="search" className="text-[var(--color-text3)]" />
        <input
          type="text"
          placeholder="Search by name, email, or phone..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 bg-transparent text-sm outline-none placeholder:text-[var(--color-text3)]"
        />
      </div>

      {filtered.length === 0 ? (
        <Card>
          <div className="p-8 text-center text-[var(--color-text2)]">
            <Svg name="users" className="text-4xl mb-2 text-[var(--color-text3)] block mx-auto" />
            <p className="text-sm font-medium">No customers found</p>
            <p className="text-xs text-[var(--color-text3)] mt-1">
              {search ? 'Try adjusting your search query.' : 'Click "Add Customer" to start building your directory.'}
            </p>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map((c) => (
            <Card key={c.id} className="relative group overflow-hidden">
              <div className="p-5 flex flex-col justify-between h-full">
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <h3 className="font-semibold text-base text-[var(--color-text)] truncate">{c.name}</h3>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => openEdit(c)}
                        className="p-1.5 rounded-lg text-[var(--color-text2)] hover:bg-[var(--color-input-bg)] hover:text-[var(--color-primary)] transition-colors cursor-pointer"
                        title="Edit"
                      >
                        <Svg name="edit" className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(c.id)}
                        className="p-1.5 rounded-lg text-[var(--color-text2)] hover:bg-red-50 dark:hover:bg-red-950/20 hover:text-red transition-colors cursor-pointer"
                        title="Delete"
                      >
                        <Svg name="trash" className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div className="space-y-1.5 text-xs text-[var(--color-text2)]">
                    {c.email && (
                      <div className="flex items-center gap-1.5">
                        <span className="font-semibold w-12 shrink-0">Email:</span>
                        <span className="truncate">{c.email}</span>
                      </div>
                    )}
                    {c.phone && (
                      <div className="flex items-center gap-1.5">
                        <span className="font-semibold w-12 shrink-0">Phone:</span>
                        <span>{c.phone}</span>
                      </div>
                    )}
                    {c.cr && (
                      <div className="flex items-center gap-1.5">
                        <span className="font-semibold w-12 shrink-0">C.R. No:</span>
                        <span>{c.cr}</span>
                      </div>
                    )}
                    {c.address && (
                      <div className="flex items-start gap-1.5 mt-1 pt-1 border-t border-[var(--color-border)]/50">
                        <span className="font-semibold w-12 shrink-0">Address:</span>
                        <span className="line-clamp-2">{c.address}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} maxW="480px">
        <form onSubmit={handleSave} className="space-y-4">
          <div className="flex items-center justify-between border-b border-[var(--color-border)] pb-3 mb-2">
            <h2 className="text-base font-bold">{editingCust ? 'Edit Customer' : 'Add New Customer'}</h2>
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              className="text-[var(--color-text3)] hover:text-[var(--color-text)] cursor-pointer text-lg leading-none"
            >
              &times;
            </button>
          </div>

          <div className="space-y-3">
            <div>
              <label className="text-xs font-semibold text-[var(--color-text2)] block mb-1">
                Customer Name <span className="text-red">*</span>
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Acme Corporation"
                className="w-full px-3 py-2 rounded-lg border border-[var(--color-input-border)] bg-[var(--color-input-bg)] text-sm outline-none focus:ring-2 focus:ring-[var(--color-primary-ring)]"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-[var(--color-text2)] block mb-1">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="billing@acme.com"
                  className="w-full px-3 py-2 rounded-lg border border-[var(--color-input-border)] bg-[var(--color-input-bg)] text-sm outline-none focus:ring-2 focus:ring-[var(--color-primary-ring)]"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-[var(--color-text2)] block mb-1">Phone</label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+1 (555) 019-2834"
                  className="w-full px-3 py-2 rounded-lg border border-[var(--color-input-border)] bg-[var(--color-input-bg)] text-sm outline-none focus:ring-2 focus:ring-[var(--color-primary-ring)]"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-[var(--color-text2)] block mb-1">C.R. Number / Tax ID</label>
              <input
                type="text"
                value={cr}
                onChange={(e) => setCr(e.target.value)}
                placeholder="e.g. CR-8394829"
                className="w-full px-3 py-2 rounded-lg border border-[var(--color-input-border)] bg-[var(--color-input-bg)] text-sm outline-none focus:ring-2 focus:ring-[var(--color-primary-ring)]"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-[var(--color-text2)] block mb-1">Address</label>
              <textarea
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="123 Business Rd, Suite 100..."
                rows={3}
                className="w-full px-3 py-2 rounded-lg border border-[var(--color-input-border)] bg-[var(--color-input-bg)] text-sm outline-none focus:ring-2 focus:ring-[var(--color-primary-ring)] resize-none"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-[var(--color-border)]">
            <Button type="button" variant="outline" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">
              {editingCust ? 'Save Changes' : 'Add Customer'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
