import React, { useState } from 'react'
import { useAuth } from '../hooks/useAuth'
import { useAuthCleanup } from '../hooks/useAuthCleanup'
import { Anchor, LogOut, Menu, Bell, User, ChevronDown } from 'lucide-react'
import NotificationCenter from './NotificationCenter'
import Button from './ui/Button'
import Badge from './ui/Badge'
import BoltBadge from './ui/BoltBadge'

interface LayoutProps {
  children: React.ReactNode
  currentPage: string
  onNavigate: (page: string) => void
}

const Layout: React.FC<LayoutProps> = ({ children, currentPage, onNavigate }) => {
  const { user } = useAuth()
  const { quickLogout, completeLogout } = useAuthCleanup()
  const [showNotifications, setShowNotifications] = useState(false)
  const [showUserMenu, setShowUserMenu] = useState(false)

  const handleSignOut = async () => {
    try {
      await quickLogout()
    } catch (error) {
      console.error('Logout failed, attempting complete logout:', error)
      await completeLogout()
    }
  }

  const getRoleVariant = (role: string): 'success' | 'primary' | 'secondary' => {
    switch (role) {
      case 'terminal':
        return 'success'
      case 'provider':
        return 'primary'
      case 'captain':
        return 'secondary'
      default:
        return 'secondary'
    }
  }

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'terminal':
        return 'Terminal Operator'
      case 'provider':
        return 'Service Provider'
      case 'captain':
        return 'Ship Captain'
      default:
        return role
    }
  }

  return (
    <div className="min-h-screen bg-secondary-50">
      {/* Header */}
      <header className="bg-white shadow-soft border-b border-secondary-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center space-x-4">
              <div className="flex items-center group cursor-pointer" onClick={() => onNavigate('dashboard')}>
                <div className="p-2 bg-primary-600 rounded-lg mr-3 group-hover:bg-primary-700 transition-colors">
                  <Anchor className="h-6 w-6 text-white" />
                </div>
                <h1 className="text-xl font-bold text-secondary-900 group-hover:text-primary-600 transition-colors">
                  PortConnect
                </h1>
              </div>

              {/* Bolt.new Badge - Circular */}
              <div className="flex items-center">
                <BoltBadge variant="compact" position="inline" />
              </div>


            </div>

            {/* Navigation */}
            <nav className="hidden md:flex space-x-2">
              <Button
                variant={currentPage === 'dashboard' ? 'secondary' : 'ghost'}
                size="sm"
                onClick={() => onNavigate('dashboard')}
              >
                Dashboard
              </Button>
              <Button
                variant={currentPage === 'reservations' ? 'secondary' : 'ghost'}
                size="sm"
                onClick={() => onNavigate('reservations')}
              >
                Reservations
              </Button>

              {/* Provider-specific navigation */}
              {user?.role === 'provider' && (
                <Button
                  variant={currentPage === 'services' ? 'secondary' : 'ghost'}
                  size="sm"
                  onClick={() => onNavigate('services')}
                >
                  My Services
                </Button>
              )}

              {/* Terminal-specific navigation */}
              {user?.role === 'terminal' && (
                <Button
                  variant={currentPage === 'management' ? 'secondary' : 'ghost'}
                  size="sm"
                  onClick={() => onNavigate('management')}
                >
                  Port Operations
                </Button>
              )}

              {/* Admin-only navigation (for future admin role) */}
              {(user?.role as any) === 'admin' && (
                <Button
                  variant={currentPage === 'management' ? 'secondary' : 'ghost'}
                  size="sm"
                  onClick={() => onNavigate('management')}
                >
                  Port Management
                </Button>
              )}
            </nav>

            {/* User menu */}
            <div className="flex items-center space-x-3">
              {/* Notifications */}
              <div className="relative">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowNotifications(true)}
                  icon={<Bell className="h-4 w-4" />}
                  className="relative"
                >
                  <span className="sr-only">Notifications</span>
                </Button>
                <span className="absolute -top-1 -right-1 h-2 w-2 bg-error-500 rounded-full animate-pulse"></span>
              </div>

              {/* User info */}
              <div className="relative">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center space-x-3 p-2 rounded-lg hover:bg-secondary-100 transition-colors"
                >
                  <div className="text-right hidden sm:block">
                    <div className="text-sm font-medium text-secondary-900">{user?.name}</div>
                    <div className="text-xs text-secondary-500">{user?.email}</div>
                  </div>
                  <Badge variant={getRoleVariant(user?.role || '')} size="sm">
                    {getRoleLabel(user?.role || '')}
                  </Badge>
                  <div className="p-1.5 bg-secondary-200 rounded-full">
                    <User className="h-4 w-4 text-secondary-600" />
                  </div>
                  <ChevronDown className="h-4 w-4 text-secondary-400" />
                </button>

                {/* User dropdown */}
                {showUserMenu && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-medium border border-secondary-200 py-1 z-50 animate-slide-down">
                    <div className="px-4 py-2 border-b border-secondary-100">
                      <p className="text-sm font-medium text-secondary-900">{user?.name}</p>
                      <p className="text-xs text-secondary-500">{user?.email}</p>
                    </div>
                    <button
                      onClick={handleSignOut}
                      className="w-full text-left px-4 py-2 text-sm text-secondary-700 hover:bg-secondary-50 flex items-center gap-2"
                    >
                      <LogOut className="h-4 w-4" />
                      Sign out
                    </button>
                  </div>
                )}
              </div>

              {/* Mobile menu button */}
              <Button
                variant="ghost"
                size="sm"
                className="md:hidden"
                icon={<Menu className="h-4 w-4" />}
              >
                <span className="sr-only">Menu</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
        <div className="animate-slide-up">
          {children}
        </div>
      </main>

      {/* Bolt.new Badge - Required for hackathon */}
      <BoltBadge variant="default" position="fixed" draggable={true} />

      {/* Notification Center */}
      <NotificationCenter
        isOpen={showNotifications}
        onClose={() => setShowNotifications(false)}
      />
    </div>
  )
}

export default Layout
