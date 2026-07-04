import { useState } from 'react'
import { useApp } from '@/store/AppContext'
import { useUI } from '@/store/UIContext'
import { Card, Button, Modal } from '@/components/ui'
import { Svg } from '@/icons'
import { uid } from '@/utils/uid'
import { dp as getDp } from '@/utils'
import type { ProductRecord } from '@/types/product'

export default function Products() {
  const { state, getCo, saveProductRecord, deleteProductRecord } = useApp()
  const { showToast } = useUI()
  const co = getCo()
  const coId = co?.id

  const cur = co?.currency
  const decimals = cur ? getDp(cur.subPer) : 2

  const [search, setSearch] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [editingProd, setEditingProd] = useState<ProductRecord | null>(null)

  // Form states
  const [name, setName] = useState('')
  const [desc, setDesc] = useState('')
  const [price, setPrice] = useState('')

  const activeProducts = state.products.filter((p) => p.companyId === coId)
  const filtered = activeProducts.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.desc.toLowerCase().includes(search.toLowerCase())
  )

  const openAdd = () => {
    setEditingProd(null)
    setName('')
    setDesc('')
    setPrice('')
    setModalOpen(true)
  }

  const openEdit = (p: ProductRecord) => {
    setEditingProd(p)
    setName(p.name)
    setDesc(p.desc)
    setPrice(p.price.toString())
    setModalOpen(true)
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!coId) {
      showToast('No active company selected.', 'err')
      return
    }
    if (!name.trim()) {
      showToast('Product name is required.', 'err')
      return
    }
    const numPrice = parseFloat(price)
    if (isNaN(numPrice) || numPrice < 0) {
      showToast('Please enter a valid price.', 'err')
      return
    }

    try {
      const record: ProductRecord = {
        id: editingProd?.id || uid(),
        companyId: coId,
        name: name.trim(),
        desc: desc.trim(),
        price: numPrice,
        createdAt: editingProd?.createdAt || Date.now(),
      }
      await saveProductRecord(record)
      showToast(editingProd ? 'Product updated successfully!' : 'Product added successfully!')
      setModalOpen(false)
    } catch {
      showToast('Failed to save product.', 'err')
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this product/service?')) return
    try {
      await deleteProductRecord(id)
      showToast('Product/Service deleted successfully.')
    } catch {
      showToast('Failed to delete product.', 'err')
    }
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
        <div>
          <h1 className="text-xl font-bold">Products & Services</h1>
          <p className="text-sm text-[var(--color-text2)]">Manage items and pricing for quickly populating line items.</p>
        </div>
        <Button onClick={openAdd} className="sm:self-center">
          <span className="text-lg leading-none">+</span> Add Item
        </Button>
      </div>

      <div className="mb-5 flex items-center gap-2 px-3 py-2.5 rounded-xl border border-[var(--color-border)] bg-[var(--color-card)] max-w-md">
        <Svg name="search" className="text-[var(--color-text3)]" />
        <input
          type="text"
          placeholder="Search by name or description..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 bg-transparent text-sm outline-none placeholder:text-[var(--color-text3)]"
        />
      </div>

      {filtered.length === 0 ? (
        <Card>
          <div className="p-8 text-center text-[var(--color-text2)]">
            <Svg name="box" className="text-4xl mb-2 text-[var(--color-text3)] block mx-auto" />
            <p className="text-sm font-medium">No products or services found</p>
            <p className="text-xs text-[var(--color-text3)] mt-1">
              {search ? 'Try adjusting your search query.' : 'Click "Add Item" to start building your product list.'}
            </p>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map((p) => (
            <Card key={p.id} className="relative group overflow-hidden">
              <div className="p-5 flex flex-col justify-between h-full">
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <h3 className="font-semibold text-base text-[var(--color-text)] truncate">{p.name}</h3>
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={() => openEdit(p)}
                        className="p-1.5 rounded-lg text-[var(--color-text2)] hover:bg-[var(--color-input-bg)] hover:text-[var(--color-primary)] transition-colors cursor-pointer"
                        title="Edit"
                      >
                        <Svg name="edit" className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(p.id)}
                        className="p-1.5 rounded-lg text-[var(--color-text2)] hover:bg-red-50 dark:hover:bg-red-950/20 hover:text-red transition-colors cursor-pointer"
                        title="Delete"
                      >
                        <Svg name="trash" className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div className="text-lg font-bold text-[var(--color-primary)] mb-2">
                    {cur?.code} {p.price.toFixed(decimals)}
                  </div>

                  {p.desc && (
                    <div className="text-xs text-[var(--color-text2)] mt-1 pt-1 border-t border-[var(--color-border)]/50">
                      <p className="font-semibold mb-0.5 text-[var(--color-text3)]">Description:</p>
                      <p className="line-clamp-3 whitespace-pre-wrap">{p.desc}</p>
                    </div>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} maxW="480px">
        <form onSubmit={handleSave} className="space-y-4">
          <div className="flex items-center justify-between border-b border-[var(--color-border)] pb-3 mb-2">
            <h2 className="text-base font-bold">{editingProd ? 'Edit Item' : 'Add New Item'}</h2>
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
                Item/Service Name <span className="text-red">*</span>
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Monthly Consulting Fee"
                className="w-full px-3 py-2 rounded-lg border border-[var(--color-input-border)] bg-[var(--color-input-bg)] text-sm outline-none focus:ring-2 focus:ring-[var(--color-primary-ring)]"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-[var(--color-text2)] block mb-1">
                Unit Price ({cur?.code || 'Price'}) <span className="text-red">*</span>
              </label>
              <input
                type="number"
                required
                min="0"
                step="0.001"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="0.00"
                className="w-full px-3 py-2 rounded-lg border border-[var(--color-input-border)] bg-[var(--color-input-bg)] text-sm outline-none focus:ring-2 focus:ring-[var(--color-primary-ring)]"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-[var(--color-text2)] block mb-1">Description</label>
              <textarea
                value={desc}
                onChange={(e) => setDesc(e.target.value)}
                placeholder="Enter standard item description/details..."
                rows={4}
                className="w-full px-3 py-2 rounded-lg border border-[var(--color-input-border)] bg-[var(--color-input-bg)] text-sm outline-none focus:ring-2 focus:ring-[var(--color-primary-ring)] resize-none"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-[var(--color-border)]">
            <Button type="button" variant="outline" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">
              {editingProd ? 'Save Changes' : 'Add Item'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
