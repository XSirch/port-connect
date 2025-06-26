import React, { useState } from 'react'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import { ToastProvider } from './contexts/ToastContext'
import Auth from './components/Auth'
import Layout from './components/Layout'
import Dashboard from './components/Dashboard'
import ServiceManagement from './components/ServiceManagement'
import ReservationManagement from './components/ReservationManagement'
import PortManagement from './components/PortManagement'
import LoadingSpinner from './components/ui/LoadingSpinner'
import './App.css'

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
        return <Dashboard />
      case 'services':
        return <ServiceManagement />
      case 'reservations':
        return <ReservationManagement />
      case 'management':
        return <PortManagement />
      default:
        return <Dashboard />
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
