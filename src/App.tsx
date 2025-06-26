import React, { useState, Suspense } from 'react'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import { ToastProvider } from './contexts/ToastContext'
import ErrorBoundary from './components/ui/ErrorBoundary'
import Auth from './components/Auth'
import Layout from './components/Layout'
import LoadingSpinner from './components/ui/LoadingSpinner'
import { DashboardSkeleton } from './components/ui/SkeletonLoader'
import './App.css'

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
          <Suspense fallback={<DashboardSkeleton />}>
            <Dashboard />
          </Suspense>
        )
      case 'services':
        return (
          <Suspense fallback={<DashboardSkeleton />}>
            <ServiceManagement />
          </Suspense>
        )
      case 'reservations':
        return (
          <Suspense fallback={<DashboardSkeleton />}>
            <ReservationManagement />
          </Suspense>
        )
      case 'management':
        return (
          <Suspense fallback={<DashboardSkeleton />}>
            <PortManagement />
          </Suspense>
        )
      default:
        return (
          <Suspense fallback={<DashboardSkeleton />}>
            <Dashboard />
          </Suspense>
        )
    }
  }

  return (
    <Layout currentPage={currentPage} onNavigate={setCurrentPage}>
      <ErrorBoundary>
        {renderCurrentPage()}
      </ErrorBoundary>
    </Layout>
  )
}

function App() {
  return (
    <ErrorBoundary>
      <ToastProvider>
        <AuthProvider>
          <AppContent />
        </AuthProvider>
      </ToastProvider>
    </ErrorBoundary>
  )
}

export default App