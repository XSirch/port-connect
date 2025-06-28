import { supabase } from '../lib/supabase'

/**
 * Força a limpeza completa de todos os dados de autenticação
 * Use esta função quando houver problemas persistentes de autenticação
 */
export const forceAuthClear = async () => {
  try {
    // 1. Sign out from Supabase
    await supabase.auth.signOut()

    // 2. Clear all localStorage
    const keysToRemove = []
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key) {
        keysToRemove.push(key)
      }
    }
    keysToRemove.forEach(key => localStorage.removeItem(key))

    // 3. Clear all sessionStorage
    sessionStorage.clear()

    // 4. Set force clear flag
    localStorage.setItem('force_auth_clear', 'true')

    // 5. Reload page to ensure clean state
    window.location.reload()

  } catch (error) {
    // Even if there's an error, reload the page
    window.location.reload()
  }
}

/**
 * Verifica se há dados de autenticação corrompidos
 */
export const checkAuthIntegrity = async () => {
  try {
    const { data: { session }, error } = await supabase.auth.getSession()

    if (error) {
      return false
    }

    if (!session) {
      return true // No session is valid
    }

    // Check if session is expired
    const now = Math.floor(Date.now() / 1000)
    if (session.expires_at && session.expires_at < now) {
      return false
    }

    // Check if user object is valid
    if (!session.user?.id || !session.user?.email) {
      return false
    }

    return true

  } catch (error) {
    return false
  }
}

/**
 * Limpa apenas dados específicos do Supabase
 */
export const clearSupabaseData = () => {
  try {
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
    const hostname = new URL(supabaseUrl).hostname.split('.')[0]
    const storageKey = `sb-${hostname}-auth-token`

    // Clear specific Supabase keys
    localStorage.removeItem(storageKey)
    sessionStorage.removeItem(storageKey)

    // Clear any other Supabase-related keys
    const authKeys = Object.keys(localStorage).filter(key =>
      key.includes('supabase') || key.includes('auth') || key.includes(hostname)
    )
    authKeys.forEach(key => localStorage.removeItem(key))

    const sessionAuthKeys = Object.keys(sessionStorage).filter(key =>
      key.includes('supabase') || key.includes('auth') || key.includes(hostname)
    )
    sessionAuthKeys.forEach(key => sessionStorage.removeItem(key))

  } catch (error) {
    // Silently handle errors in production
  }
}

/**
 * Comprehensive authentication cleanup for logout and tab close
 */
export const comprehensiveAuthCleanup = async (preservePreferences = false) => {
  try {
    // 1. Sign out from Supabase first
    await supabase.auth.signOut()

    // 2. Clear all authentication-related localStorage
    const authKeys = [
      'supabase.auth.token',
      'sb-auth-token',
      'auth_token',
      'user_session',
      'access_token',
      'refresh_token'
    ]

    // Get Supabase-specific keys
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
    if (supabaseUrl) {
      const hostname = new URL(supabaseUrl).hostname.split('.')[0]
      authKeys.push(`sb-${hostname}-auth-token`)
    }

    // Clear authentication keys
    authKeys.forEach(key => {
      localStorage.removeItem(key)
      sessionStorage.removeItem(key)
    })

    // 3. Clear all Supabase-related keys
    const allLocalStorageKeys = Object.keys(localStorage)
    const allSessionStorageKeys = Object.keys(sessionStorage)

    allLocalStorageKeys.forEach(key => {
      if (key.includes('supabase') || key.includes('auth') || key.includes('session')) {
        localStorage.removeItem(key)
      }
    })

    allSessionStorageKeys.forEach(key => {
      if (key.includes('supabase') || key.includes('auth') || key.includes('session')) {
        sessionStorage.removeItem(key)
      }
    })

    // 4. Clear cookies (authentication-related only)
    clearAuthCookies()

    // 5. Clear cached user data unless preserving preferences
    if (!preservePreferences) {
      const userDataKeys = [
        'user_preferences',
        'user_settings',
        'cached_user_data',
        'user_profile'
      ]
      userDataKeys.forEach(key => {
        localStorage.removeItem(key)
        sessionStorage.removeItem(key)
      })
    }

    // 6. Clear any cached API responses
    clearCachedApiData()

  } catch (error) {
    console.warn('Error during comprehensive auth cleanup:', error)
    // Continue with cleanup even if some steps fail
  }
}

/**
 * Clear authentication-related cookies
 */
export const clearAuthCookies = () => {
  try {
    const authCookieNames = [
      'auth_token',
      'session_token',
      'access_token',
      'refresh_token',
      'supabase-auth-token',
      'sb-auth-token'
    ]

    authCookieNames.forEach(cookieName => {
      // Clear for current domain
      document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`

      // Clear for parent domain
      const domain = window.location.hostname
      document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=${domain};`

      // Clear for subdomain
      if (domain.includes('.')) {
        const parentDomain = '.' + domain.split('.').slice(-2).join('.')
        document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=${parentDomain};`
      }
    })
  } catch (error) {
    console.warn('Error clearing auth cookies:', error)
  }
}

/**
 * Clear cached API responses that might contain user data
 */
export const clearCachedApiData = () => {
  try {
    const cacheKeys = Object.keys(localStorage).filter(key =>
      key.includes('cache') ||
      key.includes('api_') ||
      key.includes('response_') ||
      key.includes('query_')
    )

    cacheKeys.forEach(key => localStorage.removeItem(key))

    // Clear sessionStorage cache as well
    const sessionCacheKeys = Object.keys(sessionStorage).filter(key =>
      key.includes('cache') ||
      key.includes('api_') ||
      key.includes('response_') ||
      key.includes('query_')
    )

    sessionCacheKeys.forEach(key => sessionStorage.removeItem(key))
  } catch (error) {
    console.warn('Error clearing cached API data:', error)
  }
}

/**
 * Setup beforeunload event listener for tab/window close cleanup
 */
export const setupTabCloseCleanup = () => {
  const handleBeforeUnload = (event: BeforeUnloadEvent) => {
    // Clear sensitive data immediately (synchronous)
    try {
      // Clear authentication tokens
      const authKeys = [
        'supabase.auth.token',
        'sb-auth-token',
        'auth_token',
        'access_token',
        'refresh_token'
      ]

      authKeys.forEach(key => {
        localStorage.removeItem(key)
        sessionStorage.removeItem(key)
      })

      // Clear Supabase-specific keys
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
      if (supabaseUrl) {
        const hostname = new URL(supabaseUrl).hostname.split('.')[0]
        localStorage.removeItem(`sb-${hostname}-auth-token`)
        sessionStorage.removeItem(`sb-${hostname}-auth-token`)
      }

      // Clear session storage completely for security
      sessionStorage.clear()

    } catch (error) {
      console.warn('Error during tab close cleanup:', error)
    }
  }

  // Add event listener
  window.addEventListener('beforeunload', handleBeforeUnload)

  // Return cleanup function
  return () => {
    window.removeEventListener('beforeunload', handleBeforeUnload)
  }
}

/**
 * Force complete authentication reset (for emergency use)
 */
export const emergencyAuthReset = async () => {
  try {
    // 1. Comprehensive cleanup
    await comprehensiveAuthCleanup(false)

    // 2. Clear ALL localStorage and sessionStorage
    localStorage.clear()
    sessionStorage.clear()

    // 3. Clear all cookies
    document.cookie.split(";").forEach(cookie => {
      const eqPos = cookie.indexOf("=")
      const name = eqPos > -1 ? cookie.substr(0, eqPos) : cookie
      document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`
    })

    // 4. Force page reload
    window.location.href = '/login'

  } catch (error) {
    console.error('Emergency auth reset failed:', error)
    // Force reload anyway
    window.location.reload()
  }
}

// Debug function for development only - removed in production
