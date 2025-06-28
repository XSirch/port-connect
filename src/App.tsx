import React, { useState, Suspense } from 'react'
import { AuthProvider } from './contexts/AuthContext'
import { useAuth } from './hooks/useAuth'
import { useSessionValidator } from './hooks/useSessionValidator'
import { ToastProvider } from './contexts/ToastContext'
import Auth from './components/Auth'
import Layout from './components/Layout'
import LoadingSpinner from './components/ui/LoadingSpinner'
import AuthCleanupTest from './components/AuthCleanupTest'


// Lazy loading dos componentes principais
const Dashboard = React.lazy(() => import('./components/Dashboard'))
const ServiceManagement = React.lazy(() => import('./components/ServiceManagement'))
const ReservationManagement = React.lazy(() => import('./components/ReservationManagement'))
const PortManagement = React.lazy(() => import('./components/PortManagement'))
const PortOperations = React.lazy(() => import('./components/PortOperations'))

const AppContent: React.FC = () => {
  const { user, loading } = useAuth()
  const [currentPage, setCurrentPage] = useState('dashboard')

  // Validar sessão periodicamente
  useSessionValidator()

  if (loading) {
    return (
      <div className="min-h-screen bg-secondary-50 flex items-center justify-center">
        <LoadingSpinner size="lg" text="Loading PortConnect..." />
      </div>
    )
  }

  if (!user) {
    return <Auth />
  }

  const renderCurrentPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return (
          <Suspense fallback={<LoadingSpinner />}>
            <Dashboard setCurrentPage={setCurrentPage} />
          </Suspense>
        )
      case 'services':
        return (
          <Suspense fallback={<LoadingSpinner />}>
            <ServiceManagement />
          </Suspense>
        )
      case 'reservations':
        return (
          <Suspense fallback={<LoadingSpinner />}>
            <ReservationManagement />
          </Suspense>
        )
      case 'management':
        // Role-based access control for port management
        if (user.role === 'terminal') {
          return (
            <Suspense fallback={<LoadingSpinner />}>
              <PortOperations />
            </Suspense>
          )
        } else {
          return (
            <Suspense fallback={<LoadingSpinner />}>
              <PortManagement />
            </Suspense>
          )
        }
      case 'port-operations':
        return (
          <Suspense fallback={<LoadingSpinner />}>
            <PortOperations />
          </Suspense>
        )
      default:
        return (
          <Suspense fallback={<LoadingSpinner />}>
            <Dashboard setCurrentPage={setCurrentPage} />
          </Suspense>
        )
    }
  }

  return (
    <Layout currentPage={currentPage} onNavigate={setCurrentPage}>
      {renderCurrentPage()}
    </Layout>
  )
}

function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <AppContent />
        {/* Development only - Auth cleanup testing component */}
        <AuthCleanupTest />
      </AuthProvider>
    </ToastProvider>
  )
}

export default App