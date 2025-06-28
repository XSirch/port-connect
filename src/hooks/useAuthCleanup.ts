import { useCallback, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { 
  comprehensiveAuthCleanup, 
  emergencyAuthReset,
  clearAuthCookies,
  clearCachedApiData
} from '../utils/authUtils'

/**
 * Custom hook for managing authentication cleanup operations
 */
export const useAuthCleanup = () => {
  const { signOut, forceSignOut, clearAllAuthData } = useAuth()

  // Quick logout with preference preservation
  const quickLogout = useCallback(async () => {
    try {
      await signOut()
    } catch (error) {
      console.error('Quick logout failed:', error)
      await forceSignOut()
    }
  }, [signOut, forceSignOut])

  // Complete logout with full cleanup
  const completeLogout = useCallback(async () => {
    try {
      await forceSignOut()
    } catch (error) {
      console.error('Complete logout failed:', error)
      await emergencyAuthReset()
    }
  }, [forceSignOut])

  // Emergency cleanup (for critical security situations)
  const emergencyCleanup = useCallback(async () => {
    try {
      await emergencyAuthReset()
    } catch (error) {
      console.error('Emergency cleanup failed:', error)
      // Force page reload as last resort
      window.location.reload()
    }
  }, [])

  // Clear only cached data (keep authentication)
  const clearCacheOnly = useCallback(async () => {
    try {
      clearCachedApiData()
      clearAuthCookies()
    } catch (error) {
      console.warn('Cache cleanup failed:', error)
    }
  }, [])

  // Setup automatic cleanup on page visibility change
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        // Page is hidden (tab switched, minimized, etc.)
        // Clear sensitive session data
        try {
          sessionStorage.removeItem('temp_auth_data')
          sessionStorage.removeItem('current_session')
        } catch (error) {
          console.warn('Visibility change cleanup failed:', error)
        }
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [])

  // Setup automatic cleanup on focus loss (for mobile)
  useEffect(() => {
    const handleBlur = () => {
      // Clear temporary sensitive data when app loses focus
      try {
        sessionStorage.removeItem('temp_tokens')
        sessionStorage.removeItem('pending_auth')
      } catch (error) {
        console.warn('Blur cleanup failed:', error)
      }
    }

    const handleFocus = () => {
      // Verify auth integrity when app regains focus
      try {
        // Get session from Supabase directly to avoid hook rules
        import('../lib/supabase').then(({ supabase }) => {
          supabase.auth.getSession().then(({ data: { session } }) => {
            if (session) {
              // Check if session is still valid
              const now = Math.floor(Date.now() / 1000)
              if (session.expires_at && session.expires_at < now) {
                forceSignOut()
              }
            }
          })
        })
      } catch (error) {
        console.warn('Focus auth check failed:', error)
      }
    }

    window.addEventListener('blur', handleBlur)
    window.addEventListener('focus', handleFocus)

    return () => {
      window.removeEventListener('blur', handleBlur)
      window.removeEventListener('focus', handleFocus)
    }
  }, [forceSignOut])

  return {
    quickLogout,
    completeLogout,
    emergencyCleanup,
    clearCacheOnly,
    clearAllAuthData
  }
}

export default useAuthCleanup
