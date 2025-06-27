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

// Debug function for development only - removed in production
