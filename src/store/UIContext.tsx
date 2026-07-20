import { createContext, useContext, useReducer, useEffect, type ReactNode } from 'react'
import type { Toast, ToastType } from '@/types'
import { uid } from '@/utils/uid'

interface UIState {
  sidebarOpen: boolean
  dark: boolean
  formDirty: boolean
  toasts: Toast[]
  resetModal: boolean
  previewModal: boolean
  previewContent: string
  pdfOverlay: boolean
}

type UIAction =
  | { type: 'TOGGLE_SIDEBAR' }
  | { type: 'CLOSE_SIDEBAR' }
  | { type: 'SET_DARK'; payload: boolean }
  | { type: 'SET_FORM_DIRTY'; payload: boolean }
  | { type: 'ADD_TOAST'; payload: Toast }
  | { type: 'REMOVE_TOAST'; payload: string }
  | { type: 'SET_RESET_MODAL'; payload: boolean }
  | { type: 'SET_PREVIEW'; payload: { open: boolean; content?: string } }
  | { type: 'SET_PDF_OVERLAY'; payload: boolean }

function uiReducer(state: UIState, action: UIAction): UIState {
  switch (action.type) {
    case 'TOGGLE_SIDEBAR':
      return { ...state, sidebarOpen: !state.sidebarOpen }
    case 'CLOSE_SIDEBAR':
      return { ...state, sidebarOpen: false }
    case 'SET_DARK':
      return { ...state, dark: action.payload }
    case 'SET_FORM_DIRTY':
      return { ...state, formDirty: action.payload }
    case 'ADD_TOAST':
      return { ...state, toasts: [...state.toasts, action.payload] }
    case 'REMOVE_TOAST':
      return { ...state, toasts: state.toasts.filter((t) => t.id !== action.payload) }
    case 'SET_RESET_MODAL':
      return { ...state, resetModal: action.payload }
    case 'SET_PREVIEW':
      return { ...state, previewModal: action.payload.open, previewContent: action.payload.content || '' }
    case 'SET_PDF_OVERLAY':
      return { ...state, pdfOverlay: action.payload }
    default:
      return state
  }
}

const initialUI: UIState = {
  sidebarOpen: false,
  dark: false,
  formDirty: false,
  toasts: [],
  resetModal: false,
  previewModal: false,
  previewContent: '',
  pdfOverlay: false,
}

interface UIContextValue {
  ui: UIState
  dispatchUI: React.Dispatch<UIAction>
  toggleSidebar: () => void
  closeSidebar: () => void
  toggleDark: () => void
  markDirty: () => void
  markClean: () => void
  showToast: (msg: string, type?: ToastType, duration?: number) => void
  showResetModal: () => void
  hideResetModal: () => void
  showPreview: (html: string) => void
  closePreview: () => void
  showPdfOverlay: () => void
  hidePdfOverlay: () => void
}

const UIContext = createContext<UIContextValue | null>(null)

export function UIProvider({ children }: { children: ReactNode }) {
  const [ui, dispatchUI] = useReducer(uiReducer, initialUI)

  useEffect(() => {
    const isDark = localStorage.getItem('_darkMode') === '1'
    dispatchUI({ type: 'SET_DARK', payload: isDark })
    if (isDark) document.documentElement.classList.add('dark')
  }, [])

  useEffect(() => {
    if (ui.dark) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [ui.dark])

  useEffect(() => {
    const handler = (e: BeforeUnloadEvent) => {
      if (ui.formDirty) { e.preventDefault(); e.returnValue = '' }
    }
    window.addEventListener('beforeunload', handler)
    return () => window.removeEventListener('beforeunload', handler)
  }, [ui.formDirty])

  const toggleSidebar = () => dispatchUI({ type: 'TOGGLE_SIDEBAR' })
  const closeSidebar = () => dispatchUI({ type: 'CLOSE_SIDEBAR' })
  const toggleDark = () => {
    const next = !ui.dark
    localStorage.setItem('_darkMode', next ? '1' : '0')
    dispatchUI({ type: 'SET_DARK', payload: next })
  }
  const markDirty = () => dispatchUI({ type: 'SET_FORM_DIRTY', payload: true })
  const markClean = () => dispatchUI({ type: 'SET_FORM_DIRTY', payload: false })
  const showToast = (msg: string, type: ToastType = 'ok', duration = 3000) => {
    const id = uid()
    dispatchUI({ type: 'ADD_TOAST', payload: { id, msg, type, duration } })
    setTimeout(() => dispatchUI({ type: 'REMOVE_TOAST', payload: id }), duration)
  }
  const showResetModal = () => dispatchUI({ type: 'SET_RESET_MODAL', payload: true })
  const hideResetModal = () => dispatchUI({ type: 'SET_RESET_MODAL', payload: false })
  const showPreview = (html: string) => dispatchUI({ type: 'SET_PREVIEW', payload: { open: true, content: html } })
  const closePreview = () => dispatchUI({ type: 'SET_PREVIEW', payload: { open: false } })
  const showPdfOverlay = () => dispatchUI({ type: 'SET_PDF_OVERLAY', payload: true })
  const hidePdfOverlay = () => dispatchUI({ type: 'SET_PDF_OVERLAY', payload: false })

  return (
    <UIContext.Provider value={{
      ui, dispatchUI,
      toggleSidebar, closeSidebar, toggleDark,
      markDirty, markClean,
      showToast,
      showResetModal, hideResetModal,
      showPreview, closePreview,
      showPdfOverlay, hidePdfOverlay,
    }}>
      {children}
    </UIContext.Provider>
  )
}

export function useUI() {
  const ctx = useContext(UIContext)
  if (!ctx) throw new Error('useUI must be used within UIProvider')
  return ctx
}
