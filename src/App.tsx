import React, { useState, Suspense } from 'react'
import { AuthProvider } from './contexts/AuthContext'
import { useAuth } from './hooks/useAuth'
import { ToastProvider } from './contexts/ToastContext'
import Auth from './components/Auth'
import Layout from './components/Layout'
import LoadingSpinner from './components/ui/LoadingSpinner'


// Lazy loading dos componentes principais
const Dashboard = React.lazy(() => import('./components/Dashboard'))
const ServiceManagement = React.lazy(() => import('./components/ServiceManagement'))
const ReservationManagement = React.lazy(() => import('./components/ReservationManagement'))
const PortManagement = React.lazy(() => import('./components/PortManagement'))

const AppContent: React.FC = () => {
  const { user, loading } = useAuth()
  const [currentPage, setCurrentPage] = useState('dashboard')

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
        return (
          <Suspense fallback={<LoadingSpinner />}>
            <PortManagement />
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
      </AuthProvider>
    </ToastProvider>
  )
}

export default App