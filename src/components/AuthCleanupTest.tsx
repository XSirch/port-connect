import React, { useState, useEffect } from 'react'
import { useAuthCleanup } from '../hooks/useAuthCleanup'
import { useAuth } from '../contexts/AuthContext'
import Button from './ui/Button'

/**
 * Development component for testing authentication cleanup functionality
 * Remove this component in production builds
 */
const AuthCleanupTest: React.FC = () => {
  const { user, session } = useAuth()
  const { quickLogout, completeLogout, emergencyCleanup, clearCacheOnly } = useAuthCleanup()
  const [storageInfo, setStorageInfo] = useState<{
    localStorage: number
    sessionStorage: number
    cookies: number
  }>({ localStorage: 0, sessionStorage: 0, cookies: 0 })

  // Update storage info
  const updateStorageInfo = () => {
    const localStorageCount = Object.keys(localStorage).length
    const sessionStorageCount = Object.keys(sessionStorage).length
    const cookiesCount = document.cookie.split(';').filter(c => c.trim()).length

    setStorageInfo({
      localStorage: localStorageCount,
      sessionStorage: sessionStorageCount,
      cookies: cookiesCount
    })
  }

  useEffect(() => {
    updateStorageInfo()
    const interval = setInterval(updateStorageInfo, 1000)
    return () => clearInterval(interval)
  }, [])

  const addTestData = () => {
    // Add test data to storage
    localStorage.setItem('test_auth_token', 'test_token_123')
    localStorage.setItem('test_user_data', JSON.stringify({ id: 1, name: 'Test User' }))
    localStorage.setItem('test_cache_data', 'cached_response_data')
    
    sessionStorage.setItem('test_session_token', 'session_token_456')
    sessionStorage.setItem('test_temp_data', 'temporary_data')
    
    // Add test cookie
    document.cookie = 'test_auth_cookie=test_value; path=/'
    
    updateStorageInfo()
  }

  const showStorageContents = () => {
    console.group('🔍 Current Storage Contents')
    
    console.group('📦 localStorage')
    Object.keys(localStorage).forEach(key => {
      console.log(`${key}:`, localStorage.getItem(key))
    })
    console.groupEnd()
    
    console.group('🗂️ sessionStorage')
    Object.keys(sessionStorage).forEach(key => {
      console.log(`${key}:`, sessionStorage.getItem(key))
    })
    console.groupEnd()
    
    console.group('🍪 Cookies')
    document.cookie.split(';').forEach(cookie => {
      if (cookie.trim()) {
        console.log(cookie.trim())
      }
    })
    console.groupEnd()
    
    console.groupEnd()
  }

  if (process.env.NODE_ENV === 'production') {
    return null // Don't render in production
  }

  return (
    <div className="fixed bottom-4 left-4 bg-white border border-gray-300 rounded-lg shadow-lg p-4 max-w-sm z-50">
      <h3 className="text-sm font-semibold text-gray-800 mb-3">🧪 Auth Cleanup Test</h3>
      
      {/* Current Auth Status */}
      <div className="mb-3 text-xs">
        <div className="text-gray-600">
          User: {user ? `${user.email} (${user.role})` : 'Not logged in'}
        </div>
        <div className="text-gray-600">
          Session: {session ? 'Active' : 'None'}
        </div>
      </div>

      {/* Storage Info */}
      <div className="mb-3 text-xs bg-gray-50 p-2 rounded">
        <div>localStorage: {storageInfo.localStorage} items</div>
        <div>sessionStorage: {storageInfo.sessionStorage} items</div>
        <div>Cookies: {storageInfo.cookies} items</div>
      </div>

      {/* Test Actions */}
      <div className="space-y-2">
        <Button
          onClick={addTestData}
          size="sm"
          variant="secondary"
          className="w-full text-xs"
        >
          Add Test Data
        </Button>
        
        <Button
          onClick={showStorageContents}
          size="sm"
          variant="secondary"
          className="w-full text-xs"
        >
          Show Storage (Console)
        </Button>
        
        <Button
          onClick={clearCacheOnly}
          size="sm"
          variant="secondary"
          className="w-full text-xs"
        >
          Clear Cache Only
        </Button>
        
        <Button
          onClick={quickLogout}
          size="sm"
          variant="primary"
          className="w-full text-xs"
        >
          Quick Logout
        </Button>
        
        <Button
          onClick={completeLogout}
          size="sm"
          variant="danger"
          className="w-full text-xs"
        >
          Complete Logout
        </Button>
        
        <Button
          onClick={emergencyCleanup}
          size="sm"
          variant="danger"
          className="w-full text-xs"
        >
          Emergency Cleanup
        </Button>
      </div>
      
      <div className="mt-2 text-xs text-gray-500">
        Development only - hidden in production
      </div>
    </div>
  )
}

export default AuthCleanupTest
