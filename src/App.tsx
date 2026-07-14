import { lazy, Suspense } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { AppProvider, useApp } from '@/store/AppContext'
import { UIProvider, useUI } from '@/store/UIContext'
import { Sidebar } from '@/components/layout/Sidebar'
import { ErrorBoundary } from '@/components/layout/ErrorBoundary'
import { WelcomeOverlay } from '@/components/layout/WelcomeOverlay'
import { PDFOverlay } from '@/components/layout/PDFOverlay'
import { PreviewModal } from '@/components/layout/PreviewModal'
import { ToastContainer } from '@/components/ui'
import { Svg } from '@/icons'

const Dashboard = lazy(() => import('@/pages/Dashboard'))
const Invoice = lazy(() => import('@/pages/Invoice'))
const Receipt = lazy(() => import('@/pages/Receipt'))
const QuotationPage = lazy(() => import('@/pages/Quotation'))
const Customers = lazy(() => import('@/pages/Customers'))
const Products = lazy(() => import('@/pages/Products'))
const History = lazy(() => import('@/pages/History'))
const Settings = lazy(() => import('@/pages/Settings'))

function AppContent() {
  const { state, loading } = useApp()
  const { ui, toggleSidebar } = useUI()

  if (loading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-[var(--color-page-bg)]">
        <div className="text-center">
          <div className="spinner mx-auto mb-3" />
          <div className="text-sm text-[var(--color-text2)]">Loading database...</div>
        </div>
      </div>
    )
  }

  if (state.dbError) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-[var(--color-page-bg)] p-4">
        <div className="text-center max-w-md">
          <div className="text-3xl mb-3">⚠️</div>
          <h2 className="text-lg font-bold mb-2">Database Error</h2>
          <p className="text-sm text-[var(--color-text2)] mb-4">{state.dbError}</p>
          <button onClick={() => window.location.reload()} className="px-4 py-2 rounded-lg bg-[var(--color-primary)] text-white text-sm cursor-pointer">Retry</button>
        </div>
      </div>
    )
  }

  if (state.companies.length === 0 || !state.activeId) {
    return (
      <WelcomeOverlay onDone={() => window.location.reload()} />
    )
  }

  return (
    <div className="flex min-h-screen bg-[var(--color-page-bg)]">
      <Sidebar />

      {/* Hamburger for mobile */}
      <button
        onClick={toggleSidebar}
        className="fixed top-3 left-3 z-50 md:hidden w-9 h-9 flex items-center justify-center rounded-lg bg-[var(--color-card)] border border-[var(--color-border)] shadow-sm cursor-pointer"
      >
        <Svg name={ui.sidebarOpen ? 'close' : 'menu'} />
      </button>

      <main className="flex-1 ml-0 md:ml-[232px] p-5 md:p-8 max-w-5xl">
        <ErrorBoundary>
          <Suspense fallback={
            <div className="flex items-center justify-center py-20">
              <div className="spinner" />
            </div>
          }>
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/invoice" element={<Invoice />} />
              <Route path="/receipt" element={<Receipt />} />
              <Route path="/quotation" element={<QuotationPage />} />
              <Route path="/customers" element={<Customers />} />
              <Route path="/products" element={<Products />} />
              <Route path="/history" element={<History />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Suspense>
        </ErrorBoundary>
      </main>

      <PDFOverlay />
      <PreviewModal />
      <ToastContainer />
    </div>
  )
}

export default function App() {
  return (
    <AppProvider>
      <UIProvider>
        <AppContent />
      </UIProvider>
    </AppProvider>
  )
}
