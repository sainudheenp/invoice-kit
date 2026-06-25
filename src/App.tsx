import { Routes, Route } from 'react-router-dom'
import { AppProvider, useApp } from '@/store/AppContext'
import { UIProvider, useUI } from '@/store/UIContext'
import { Sidebar } from '@/components/layout/Sidebar'
import { WelcomeOverlay } from '@/components/layout/WelcomeOverlay'
import { PDFOverlay } from '@/components/layout/PDFOverlay'
import { ToastContainer } from '@/components/ui'
import { Svg } from '@/icons'
import Dashboard from '@/pages/Dashboard'
import Invoice from '@/pages/Invoice'
import Receipt from '@/pages/Receipt'
import History from '@/pages/History'
import Settings from '@/pages/Settings'

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
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/invoice" element={<Invoice />} />
          <Route path="/receipt" element={<Receipt />} />
          <Route path="/history" element={<History />} />
          <Route path="/settings" element={<Settings />} />
        </Routes>
      </main>

      <PDFOverlay />
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
