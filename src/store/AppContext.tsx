import { createContext, useContext, useReducer, useEffect, useState, type ReactNode } from 'react'
import type { Company } from '@/types/company'
import type { Invoice, LineItem, Customer } from '@/types/invoice'
import type { Receipt } from '@/types/receipt'
import type { Quotation } from '@/types/quotation'
import type { CustomerRecord } from '@/types/customer'
import type { ProductRecord } from '@/types/product'
import type { EditingDoc } from '@/types'
import { db } from '@/db'
import { uid } from '@/utils/uid'

interface AppState {
  companies: Company[]
  invoices: Invoice[]
  receipts: Receipt[]
  quotations: Quotation[]
  customers: CustomerRecord[]
  products: ProductRecord[]
  activeId: string | null
  editingDoc: EditingDoc | null
  dbError: string | null
}

type AppAction =
  | { type: 'SET_ALL'; payload: AppState }
  | { type: 'UPSERT_COMPANY'; payload: Company }
  | { type: 'REMOVE_COMPANY'; payload: string }
  | { type: 'SET_ACTIVE'; payload: string }
  | { type: 'UPSERT_INVOICE'; payload: Invoice }
  | { type: 'REMOVE_INVOICE'; payload: string }
  | { type: 'UPSERT_RECEIPT'; payload: Receipt }
  | { type: 'REMOVE_RECEIPT'; payload: string }
  | { type: 'UPSERT_QUOTATION'; payload: Quotation }
  | { type: 'REMOVE_QUOTATION'; payload: string }
  | { type: 'UPSERT_CUSTOMER'; payload: CustomerRecord }
  | { type: 'REMOVE_CUSTOMER'; payload: string }
  | { type: 'UPSERT_PRODUCT'; payload: ProductRecord }
  | { type: 'REMOVE_PRODUCT'; payload: string }
  | { type: 'SET_EDITING'; payload: EditingDoc | null }
  | { type: 'DB_ERROR'; payload: string }
  | { type: 'RESET' }

function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'SET_ALL':
      return { ...action.payload, editingDoc: null, dbError: null }
    case 'UPSERT_COMPANY': {
      const idx = state.companies.findIndex((c) => c.id === action.payload.id)
      const companies = idx >= 0
        ? state.companies.map((c, i) => (i === idx ? action.payload : c))
        : [...state.companies, action.payload]
      return { ...state, companies }
    }
    case 'REMOVE_COMPANY':
      return { ...state, companies: state.companies.filter((c) => c.id !== action.payload) }
    case 'SET_ACTIVE':
      return { ...state, activeId: action.payload }
    case 'UPSERT_INVOICE': {
      const idx = state.invoices.findIndex((i) => i.id === action.payload.id)
      const invoices = idx >= 0
        ? state.invoices.map((i, n) => (n === idx ? action.payload : i))
        : [...state.invoices, action.payload]
      return { ...state, invoices }
    }
    case 'REMOVE_INVOICE':
      return { ...state, invoices: state.invoices.filter((i) => i.id !== action.payload) }
    case 'UPSERT_RECEIPT': {
      const idx = state.receipts.findIndex((r) => r.id === action.payload.id)
      const receipts = idx >= 0
        ? state.receipts.map((r, n) => (n === idx ? action.payload : r))
        : [...state.receipts, action.payload]
      return { ...state, receipts }
    }
    case 'REMOVE_RECEIPT':
      return { ...state, receipts: state.receipts.filter((r) => r.id !== action.payload) }
    case 'UPSERT_QUOTATION': {
      const idx = state.quotations.findIndex((q) => q.id === action.payload.id)
      const quotations = idx >= 0
        ? state.quotations.map((q, n) => (n === idx ? action.payload : q))
        : [...state.quotations, action.payload]
      return { ...state, quotations }
    }
    case 'REMOVE_QUOTATION':
      return { ...state, quotations: state.quotations.filter((q) => q.id !== action.payload) }
    case 'UPSERT_CUSTOMER': {
      const idx = state.customers.findIndex((c) => c.id === action.payload.id)
      const customers = idx >= 0
        ? state.customers.map((c, i) => (i === idx ? action.payload : c))
        : [...state.customers, action.payload]
      return { ...state, customers }
    }
    case 'REMOVE_CUSTOMER':
      return { ...state, customers: state.customers.filter((c) => c.id !== action.payload) }
    case 'UPSERT_PRODUCT': {
      const idx = state.products.findIndex((p) => p.id === action.payload.id)
      const products = idx >= 0
        ? state.products.map((p, i) => (i === idx ? action.payload : p))
        : [...state.products, action.payload]
      return { ...state, products }
    }
    case 'REMOVE_PRODUCT':
      return { ...state, products: state.products.filter((p) => p.id !== action.payload) }
    case 'SET_EDITING':
      return { ...state, editingDoc: action.payload }
    case 'DB_ERROR':
      return { ...state, dbError: action.payload }
    case 'RESET':
      return { companies: [], invoices: [], receipts: [], quotations: [], customers: [], products: [], activeId: null, editingDoc: null, dbError: null }
    default:
      return state
  }
}

const initialState: AppState = {
  companies: [],
  invoices: [],
  receipts: [],
  quotations: [],
  customers: [],
  products: [],
  activeId: null,
  editingDoc: null,
  dbError: null,
}

interface AppContextValue {
  state: AppState
  dispatch: React.Dispatch<AppAction>
  loading: boolean
  getCo: () => Company | null
  saveCompany: (c: Company) => Promise<void>
  deleteCompany: (id: string) => Promise<void>
  setActive: (id: string) => void
  saveInvoice: (inv: Invoice) => Promise<void>
  deleteInvoice: (id: string) => Promise<void>
  markInvoicePaid: (id: string) => Promise<void>
  saveReceipt: (rec: Receipt) => Promise<void>
  deleteReceipt: (id: string) => Promise<void>
  saveQuotation: (quot: Quotation) => Promise<void>
  deleteQuotation: (id: string) => Promise<void>
  saveCustomerRecord: (cust: CustomerRecord) => Promise<void>
  deleteCustomerRecord: (id: string) => Promise<void>
  saveProductRecord: (prod: ProductRecord) => Promise<void>
  deleteProductRecord: (id: string) => Promise<void>
  setEditing: (doc: EditingDoc | null) => void
  resetAll: () => Promise<void>
  createInvoice: (company: Company, form: {
    invNo: string; date: string; paid: boolean
    customer: Customer; items: LineItem[]
    subtotal: number; vatPct: number; vatAmt: number; discount: number; grand: number
    notes: string; payMethod: string; payDetails: string; bankName: string
  }) => Promise<Invoice>
  createReceipt: (company: Company, form: {
    recNo: string; date: string
    receivedFrom: string; items: LineItem[]; amount: number; amountWords: string
    payMethod: string; chequeNo: string; bankName: string; transDate: string
    being: string; receiver: string; signatory: string
  }) => Promise<Receipt>
  createQuotation: (company: Company, form: {
    quotNo: string; date: string; validUntil: string
    customer: Customer; items: LineItem[]
    subtotal: number; vatPct: number; vatAmt: number; discount: number; grand: number
    notes: string; terms: string
  }) => Promise<Quotation>
}

const AppContext = createContext<AppContextValue | null>(null)

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function init() {
      try {
        await db.open()
        const [companies, invoices, receipts, quotations, customers, products] = await Promise.all([
          db.companies.toArray(),
          db.invoices.toArray(),
          db.receipts.toArray(),
          db.quotations.toArray(),
          db.customers.toArray(),
          db.products.toArray(),
        ])
        let activeId: string | null = null
        const stored = sessionStorage.getItem('dg_activeId')
        if (stored && companies.some((c) => c.id === stored)) {
          activeId = stored
        } else if (companies.length > 0) {
          activeId = companies[0].id
        }
        dispatch({ type: 'SET_ALL', payload: { companies, invoices, receipts, quotations, customers, products, activeId, editingDoc: null, dbError: null } })
      } catch (err: any) {
        console.error('Failed to load DB:', err)
        if (err?.name === 'VersionError') {
          try {
            await db.delete()
            await db.open()
            dispatch({ type: 'RESET' })
          } catch {
            dispatch({ type: 'DB_ERROR', payload: 'Failed to create database. Please clear browser storage for this site.' })
          }
        } else {
          dispatch({ type: 'DB_ERROR', payload: 'Failed to load data from IndexedDB. See console for details.' })
        }
      } finally {
        setLoading(false)
      }
    }
    init()
  }, [])

  const getCo = (): Company | null => {
    if (!state.activeId) return null
    return state.companies.find((c) => c.id === state.activeId) || null
  }

  const saveCompany = async (c: Company) => {
    await db.companies.put(c)
    dispatch({ type: 'UPSERT_COMPANY', payload: c })
  }

  const deleteCompany = async (id: string) => {
    const invs = state.invoices.filter((i) => i.companyId === id)
    const recs = state.receipts.filter((r) => r.companyId === id)
    const quots = state.quotations.filter((q) => q.companyId === id)
    const custs = state.customers.filter((c) => c.companyId === id)
    const prods = state.products.filter((p) => p.companyId === id)
    await Promise.all([
      db.companies.delete(id),
      ...invs.map((i) => db.invoices.delete(i.id)),
      ...recs.map((r) => db.receipts.delete(r.id)),
      ...quots.map((q) => db.quotations.delete(q.id)),
      ...custs.map((c) => db.customers.delete(c.id)),
      ...prods.map((p) => db.products.delete(p.id)),
    ])
    dispatch({ type: 'REMOVE_COMPANY', payload: id })
    invs.forEach((i) => dispatch({ type: 'REMOVE_INVOICE', payload: i.id }))
    recs.forEach((r) => dispatch({ type: 'REMOVE_RECEIPT', payload: r.id }))
    quots.forEach((q) => dispatch({ type: 'REMOVE_QUOTATION', payload: q.id }))
    custs.forEach((c) => dispatch({ type: 'REMOVE_CUSTOMER', payload: c.id }))
    prods.forEach((p) => dispatch({ type: 'REMOVE_PRODUCT', payload: p.id }))
  }

  const setActive = (id: string) => {
    sessionStorage.setItem('dg_activeId', id)
    dispatch({ type: 'SET_ACTIVE', payload: id })
  }

  const saveInvoice = async (inv: Invoice) => {
    await db.invoices.put(inv)
    dispatch({ type: 'UPSERT_INVOICE', payload: inv })
  }

  const deleteInvoice = async (id: string) => {
    await db.invoices.delete(id)
    dispatch({ type: 'REMOVE_INVOICE', payload: id })
  }

  const markInvoicePaid = async (id: string) => {
    const inv = state.invoices.find((i) => i.id === id)
    if (!inv) return
    const updated = { ...inv, paid: !inv.paid }
    await db.invoices.put(updated)
    dispatch({ type: 'UPSERT_INVOICE', payload: updated })
  }

  const saveReceipt = async (rec: Receipt) => {
    await db.receipts.put(rec)
    dispatch({ type: 'UPSERT_RECEIPT', payload: rec })
  }

  const deleteReceipt = async (id: string) => {
    await db.receipts.delete(id)
    dispatch({ type: 'REMOVE_RECEIPT', payload: id })
  }

  const saveQuotation = async (quot: Quotation) => {
    await db.quotations.put(quot)
    dispatch({ type: 'UPSERT_QUOTATION', payload: quot })
  }

  const deleteQuotation = async (id: string) => {
    await db.quotations.delete(id)
    dispatch({ type: 'REMOVE_QUOTATION', payload: id })
  }

  const saveCustomerRecord = async (cust: CustomerRecord) => {
    await db.customers.put(cust)
    dispatch({ type: 'UPSERT_CUSTOMER', payload: cust })
  }

  const deleteCustomerRecord = async (id: string) => {
    await db.customers.delete(id)
    dispatch({ type: 'REMOVE_CUSTOMER', payload: id })
  }

  const saveProductRecord = async (prod: ProductRecord) => {
    await db.products.put(prod)
    dispatch({ type: 'UPSERT_PRODUCT', payload: prod })
  }

  const deleteProductRecord = async (id: string) => {
    await db.products.delete(id)
    dispatch({ type: 'REMOVE_PRODUCT', payload: id })
  }

  const setEditing = (doc: EditingDoc | null) => {
    dispatch({ type: 'SET_EDITING', payload: doc })
  }

  const resetAll = async () => {
    await db.delete()
    dispatch({ type: 'RESET' })
    sessionStorage.removeItem('dg_activeId')
  }

  const createInvoice = async (company: Company, form: {
    invNo: string; date: string; paid: boolean
    customer: Customer; items: LineItem[]
    subtotal: number; vatPct: number; vatAmt: number; discount: number; grand: number
    notes: string; payMethod: string; payDetails: string; bankName: string
  }): Promise<Invoice> => {
    const now = Date.now()
    const editing = state.editingDoc?.type === 'inv' ? state.editingDoc.id : null
    const inv: Invoice = {
      id: editing || uid(),
      companyId: company.id,
      invNo: form.invNo,
      date: form.date,
      paid: form.paid,
      customer: form.customer,
      items: form.items,
      subtotal: form.subtotal,
      vatPct: form.vatPct,
      vatAmt: form.vatAmt,
      discount: form.discount,
      grand: form.grand,
      notes: form.notes,
      payMethod: form.payMethod,
      payDetails: form.payDetails,
      bankName: form.bankName,
      createdAt: now,
    }
    await db.invoices.put(inv)
    dispatch({ type: 'UPSERT_INVOICE', payload: inv })
    return inv
  }

  const createReceipt = async (company: Company, form: {
    recNo: string; date: string
    receivedFrom: string; items: LineItem[]; amount: number; amountWords: string
    payMethod: string; chequeNo: string; bankName: string; transDate: string
    being: string; receiver: string; signatory: string
  }): Promise<Receipt> => {
    const now = Date.now()
    const editing = state.editingDoc?.type === 'rec' ? state.editingDoc.id : null
    const rec: Receipt = {
      id: editing || uid(),
      companyId: company.id,
      recNo: form.recNo,
      date: form.date,
      receivedFrom: form.receivedFrom,
      items: form.items,
      amount: form.amount,
      amountWords: form.amountWords,
      payMethod: form.payMethod,
      chequeNo: form.chequeNo,
      bankName: form.bankName,
      transDate: form.transDate,
      being: form.being,
      receiver: form.receiver,
      signatory: form.signatory,
      createdAt: now,
    }
    await db.receipts.put(rec)
    dispatch({ type: 'UPSERT_RECEIPT', payload: rec })
    return rec
  }

  const createQuotation = async (company: Company, form: {
    quotNo: string; date: string; validUntil: string
    customer: Customer; items: LineItem[]
    subtotal: number; vatPct: number; vatAmt: number; discount: number; grand: number
    notes: string; terms: string
  }): Promise<Quotation> => {
    const now = Date.now()
    const editing = state.editingDoc?.type === 'quot' ? state.editingDoc.id : null
    const quot: Quotation = {
      id: editing || uid(),
      companyId: company.id,
      quotNo: form.quotNo,
      date: form.date,
      validUntil: form.validUntil,
      customer: form.customer,
      items: form.items,
      subtotal: form.subtotal,
      vatPct: form.vatPct,
      vatAmt: form.vatAmt,
      discount: form.discount,
      grand: form.grand,
      notes: form.notes,
      terms: form.terms,
      createdAt: now,
    }
    await db.quotations.put(quot)
    dispatch({ type: 'UPSERT_QUOTATION', payload: quot })
    return quot
  }

  return (
    <AppContext.Provider value={{
      state, dispatch, loading,
      getCo, saveCompany, deleteCompany, setActive,
      saveInvoice, deleteInvoice, markInvoicePaid,
      saveReceipt, deleteReceipt,
      saveQuotation, deleteQuotation,
      saveCustomerRecord, deleteCustomerRecord,
      saveProductRecord, deleteProductRecord,
      setEditing, resetAll,
      createInvoice, createReceipt, createQuotation,
    }}>
      {children}
    </AppContext.Provider>
  )
}

export function useApp() {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be used within AppProvider')
  return ctx
}
