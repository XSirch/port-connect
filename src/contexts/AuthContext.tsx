import React, { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from 'react'
import { supabase, type User } from '../lib/supabase'
import type { Session, User as SupabaseUser } from '@supabase/supabase-js'
import {
  checkAuthIntegrity,
  clearSupabaseData,
  comprehensiveAuthCleanup,
  setupTabCloseCleanup,
  emergencyAuthReset
} from '../utils/authUtils'

interface AuthContextType {
  user: User | null
  session: Session | null
  loading: boolean
  signOut: () => Promise<void>
  forceSignOut: () => Promise<void>
  clearAllAuthData: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

interface AuthProviderProps {
  children: ReactNode
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  // Setup tab close cleanup on mount
  useEffect(() => {
    const cleanup = setupTabCloseCleanup()
    return cleanup
  }, [])

  useEffect(() => {
    // Get initial session
    const initializeAuth = async () => {
      try {
        // Check for force clear flags (multiple variations)
        const forceClearFlags = [
          'force_auth_clear',
          'FORCE_AUTH_CLEAR',
          'AUTH_CLEAR_TIMESTAMP'
        ]

        const shouldForceClear = forceClearFlags.some(flag => localStorage.getItem(flag))

        if (shouldForceClear) {
          // Remove all force clear flags
          forceClearFlags.forEach(flag => localStorage.removeItem(flag))

          // Sign out from Supabase first
          try {
            await supabase.auth.signOut()
          } catch (e) {
            // Silently handle error
          }

          // Clear all auth state
          await clearAuthState()

          // Set loading to false and return
          setLoading(false)
          return
        }

        // Check auth integrity before proceeding
        const isIntegrityOk = await checkAuthIntegrity()
        if (!isIntegrityOk) {
          // Set flag for next reload
          localStorage.setItem('FORCE_AUTH_CLEAR', 'true')

          await clearAuthState()
          await supabase.auth.signOut()
          setLoading(false)
          return
        }

        const { data: { session: initialSession }, error } = await supabase.auth.getSession()

        if (error) {
          await clearAuthState()
          return
        }

        if (initialSession) {
          setSession(initialSession)

          // Add timeout to prevent infinite loading
          const profileTimeout = setTimeout(() => {
            localStorage.setItem('FORCE_AUTH_CLEAR', 'true')
            clearAuthState()
            window.location.reload()
          }, 15000) // 15 second timeout

          try {
            await fetchUserProfile(initialSession.user)
            clearTimeout(profileTimeout)
          } catch (error) {
            clearTimeout(profileTimeout)
            throw error
          }
        } else {
          setLoading(false)
        }
      } catch (error) {
        await clearAuthState()
      }
    }

    initializeAuth()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_OUT' || !session) {
        await clearAuthState()
        return
      }

      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        setSession(session)
        if (session.user) {
          await fetchUserProfile(session.user)
        }
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  const fetchUserProfile = async (authUser: SupabaseUser) => {
    try {
      // Verify session is still valid before making database calls
      const { data: sessionCheck } = await supabase.auth.getSession()
      if (!sessionCheck.session) {
        await clearAuthState()
        return
      }

      // Verify user object integrity
      if (!authUser.id || !authUser.email) {
        await clearAuthState()
        return
      }

      // Fetch user profile with timeout
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 8000) // 8 second timeout

      try {
        const { data, error } = await supabase
          .from('users')
          .select('*')
          .eq('id', authUser.id)
          .abortSignal(controller.signal)
          .single()

        clearTimeout(timeoutId)

        if (error) {
          if (error.code === 'PGRST116') {
            // User doesn't exist, create profile
            await createUserProfile(authUser)
          } else if (error.message?.includes('JWT')) {
            // JWT/Auth related error, clear session
            await clearAuthState()
          } else if (error.message?.includes('network') || error.message?.includes('fetch')) {
            // Network error, retry once
            setTimeout(() => fetchUserProfile(authUser), 2000)
          } else {
            await clearAuthState()
          }
          return
        }

        setUser(data)
        setLoading(false)

      } catch (fetchError) {
        clearTimeout(timeoutId)
        await clearAuthState()
      }

    } catch (error) {
      await clearAuthState()
    }
  }

  const createUserProfile = async (authUser: SupabaseUser) => {
    try {
      const newUserData = {
        id: authUser.id,
        email: authUser.email!,
        name: authUser.user_metadata?.name || 
              authUser.email!.split('@')[0] || 
              'User',
        role: authUser.user_metadata?.role || 'captain',
        company: authUser.user_metadata?.company || null,
        port_id: authUser.user_metadata?.port_id || null
      }

      const { data: createdUser, error } = await supabase
        .from('users')
        .insert([newUserData])
        .select()
        .single()

      if (error) {
        await clearAuthState()
        return
      }

      setUser(createdUser)
      setLoading(false)

    } catch (error) {
      await clearAuthState()
    }
  }

  const clearAuthState = async () => {
    setUser(null)
    setSession(null)
    setLoading(false)

    // Use utility function for consistent clearing
    clearSupabaseData()
  }

  // Comprehensive authentication cleanup
  const clearAllAuthData = useCallback(async () => {
    try {
      setLoading(true)

      // Clear React state
      setUser(null)
      setSession(null)

      // Comprehensive cleanup with preference preservation
      await comprehensiveAuthCleanup(true)

    } catch (error) {
      console.warn('Error during comprehensive auth cleanup:', error)
    } finally {
      setLoading(false)
    }
  }, [])

  // Force sign out with complete cleanup
  const forceSignOut = useCallback(async () => {
    try {
      setLoading(true)

      // Clear React state immediately
      setUser(null)
      setSession(null)

      // Comprehensive cleanup without preserving preferences
      await comprehensiveAuthCleanup(false)

      // Redirect to login
      window.location.href = '/login'

    } catch (error) {
      console.error('Error during force sign out:', error)
      // Emergency reset if normal cleanup fails
      await emergencyAuthReset()
    }
  }, [])

  const signOut = useCallback(async () => {
    try {
      // Clear local state immediately
      setLoading(true)
      setUser(null)
      setSession(null)

      // Comprehensive cleanup with preference preservation
      await comprehensiveAuthCleanup(true)

      // Redirect to login page
      window.location.href = '/login'

    } catch (error) {
      console.error('Error during sign out:', error)
      // Force clear state even on error
      await clearAuthState()
      window.location.href = '/login'
    }
  }, [])

  const value = {
    user,
    session,
    loading,
    signOut,
    forceSignOut,
    clearAllAuthData,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export default AuthProvider
