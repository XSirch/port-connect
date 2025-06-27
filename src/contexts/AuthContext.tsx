import React, { useEffect, useState } from 'react'
import type { User as SupabaseUser, Session } from '@supabase/supabase-js'
import { supabase, type User } from '../lib/supabase'
import { AuthContext } from './AuthContextDefinition'

interface AuthProviderProps {
  children: React.ReactNode
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  // Helper function to clear all authentication data
  const clearAuthData = async () => {
    // Clear local state
    setUser(null)
    setSession(null)

    // Get the storage key used by Supabase
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
    const hostname = new URL(supabaseUrl).hostname.split('.')[0]
    const storageKey = `sb-${hostname}-auth-token`

    // Clear all possible storage locations
    localStorage.removeItem(storageKey)
    sessionStorage.removeItem(storageKey)

    // Clear any other auth-related items
    const keysToRemove = []
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key && (key.includes('supabase') || key.includes('auth') || key.includes(hostname))) {
        keysToRemove.push(key)
      }
    }
    keysToRemove.forEach(key => localStorage.removeItem(key))

    // Clear sessionStorage as well
    const sessionKeysToRemove = []
    for (let i = 0; i < sessionStorage.length; i++) {
      const key = sessionStorage.key(i)
      if (key && (key.includes('supabase') || key.includes('auth') || key.includes(hostname))) {
        sessionKeysToRemove.push(key)
      }
    }
    sessionKeysToRemove.forEach(key => sessionStorage.removeItem(key))

    try {
      // Sign out from Supabase
      await supabase.auth.signOut({ scope: 'local' })
    } catch (error) {
      // Silently handle signOut errors
    }
  }

  useEffect(() => {
    const initializeAuth = async () => {
      try {

        // Check if this is a callback from email confirmation
        const urlParams = new URLSearchParams(window.location.search)
        const accessToken = urlParams.get('access_token')
        const refreshToken = urlParams.get('refresh_token')

        if (accessToken && refreshToken) {
          // Set the session from URL parameters
          const { data, error } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken
          })

          if (error) {
            console.error('AuthContext: Error setting session from URL:', error)
            await clearAuthData()
            setLoading(false)
            return
          }

          if (data.session?.user) {
            setSession(data.session)
            await fetchUserProfile(data.session.user)

            // Clean up URL parameters
            window.history.replaceState({}, document.title, window.location.pathname)
            return
          }
        }

        // Normal session check
        const { data: { session }, error } = await supabase.auth.getSession()

        if (error) {
          console.error('AuthContext: Error getting session:', error)
          await clearAuthData()
          setLoading(false)
          return
        }

        console.log('AuthContext: Got session:', session ? 'exists' : 'null')

        if (session?.user) {
          // Validate session is still valid
          const { data: { user }, error: userError } = await supabase.auth.getUser()

          if (userError || !user) {
            console.log('AuthContext: Session invalid, clearing...')
            await clearAuthData()
            setLoading(false)
            return
          }

          console.log('AuthContext: Valid session found, fetching user profile for:', session.user.email)
          setSession(session)
          await fetchUserProfile(session.user)
        } else {
          console.log('AuthContext: No session, setting loading to false')
          setSession(null)
          setUser(null)
          setLoading(false)
        }
      } catch (error) {
        console.error('AuthContext: Error during initialization:', error)
        await clearAuthData()
        setLoading(false)
      }
    }

    initializeAuth()

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('AuthContext: Auth state changed:', event, session ? 'session exists' : 'no session')

      if (event === 'SIGNED_OUT' || !session) {
        setSession(null)
        setUser(null)
        setLoading(false)
      } else if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        setSession(session)
        if (session?.user) {
          await fetchUserProfile(session.user)
        }
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  const fetchUserProfile = async (authUser: SupabaseUser) => {
    console.log('AuthContext: fetchUserProfile called for user:', authUser.id)

    // Add a timeout to prevent infinite loading
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Profile fetch timeout')), 20000) // 20 second timeout
    })

    try {
      const { data, error } = await Promise.race([
        supabase
          .from('users')
          .select('*')
          .eq('id', authUser.id)
          .single(),
        timeoutPromise
      ]) as any

      console.log('AuthContext: User profile query result:', { data, error })

      if (error) {
        console.error('Error fetching user profile:', error)
        // If user doesn't exist in users table, create one
        if (error.code === 'PGRST116') {
          console.log('AuthContext: User profile not found, creating new profile...')

          const newUserData = {
            id: authUser.id,
            email: authUser.email!,
            name: (authUser as any).raw_user_meta_data?.name ||
                  authUser.user_metadata?.name ||
                  authUser.email!.split('@')[0] ||
                  'User',
            role: (authUser as any).raw_user_meta_data?.role ||
                  authUser.user_metadata?.role ||
                  'captain',
            company: (authUser as any).raw_user_meta_data?.company ||
                     authUser.user_metadata?.company ||
                     null
          }

          const { data: createdUser, error: createError } = await supabase
            .from('users')
            .insert([newUserData])
            .select()
            .single()

          if (createError) {
            console.error('Error creating user profile:', createError)
            // If we can't create the profile, clear auth state
            await clearAuthData()
            return
          } else {
            console.log('AuthContext: Created new user profile:', createdUser)
            setUser(createdUser)
          }
        } else {
          // For other errors, clear auth state
          console.error('AuthContext: Database error, clearing auth state:', error)
          await clearAuthData()
          return
        }
      } else {
        console.log('AuthContext: User profile loaded successfully:', data)
        setUser(data)
      }
    } catch (error) {
      console.error('Error in fetchUserProfile:', error)
      // On any error, clear auth state to prevent stuck states
      await clearAuthData()
    } finally {
      setLoading(false)
    }
  }

  const signOut = async () => {
    try {
      console.log('AuthContext: Starting logout process...')

      // Clear local state immediately
      setUser(null)
      setSession(null)
      setLoading(false)

      // Get the storage key used by Supabase
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
      const hostname = new URL(supabaseUrl).hostname.split('.')[0]
      const storageKey = `sb-${hostname}-auth-token`

      // Clear all possible storage locations
      localStorage.removeItem(storageKey)
      sessionStorage.removeItem(storageKey)

      // Clear any other auth-related items
      const keysToRemove = []
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i)
        if (key && (key.includes('supabase') || key.includes('auth') || key.includes(hostname))) {
          keysToRemove.push(key)
        }
      }
      keysToRemove.forEach(key => localStorage.removeItem(key))

      // Clear sessionStorage as well
      const sessionKeysToRemove = []
      for (let i = 0; i < sessionStorage.length; i++) {
        const key = sessionStorage.key(i)
        if (key && (key.includes('supabase') || key.includes('auth') || key.includes(hostname))) {
          sessionKeysToRemove.push(key)
        }
      }
      sessionKeysToRemove.forEach(key => sessionStorage.removeItem(key))

      // Sign out from Supabase (this should clear server-side session)
      const { error } = await supabase.auth.signOut({ scope: 'local' })
      if (error) {
        console.warn('Supabase signOut error:', error)
      }

      console.log('AuthContext: Logout completed successfully')

      // Force a page reload to ensure clean state
      window.location.reload()

    } catch (error) {
      console.error('SignOut error:', error)
      // Force clear state even if there's an error
      setUser(null)
      setSession(null)
      setLoading(false)

      // Force reload as fallback
      window.location.reload()
    }
  }

  const value = {
    user,
    session,
    loading,
    signOut,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
