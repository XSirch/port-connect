import { useEffect, useRef } from 'react'
import { useAuth } from './useAuth'
import { supabase } from '../lib/supabase'

/**
 * Hook para validar periodicamente se a sessão ainda é válida
 * Previne estados onde o frontend pensa que está logado mas a sessão expirou
 */
export const useSessionValidator = () => {
  const { user, signOut } = useAuth()
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const isValidatingRef = useRef(false)

  useEffect(() => {
    // Só validar se há um usuário logado
    if (!user) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
      return
    }

    // Função para validar a sessão
    const validateSession = async () => {
      // Evitar validações simultâneas
      if (isValidatingRef.current) return
      
      isValidatingRef.current = true
      
      try {
        const { data: { session }, error } = await supabase.auth.getSession()
        
        if (error || !session) {
          await signOut()
          return
        }

        // Verificar se o token está próximo do vencimento (menos de 5 minutos)
        const expiresAt = session.expires_at
        if (expiresAt) {
          const now = Math.floor(Date.now() / 1000)
          const timeUntilExpiry = expiresAt - now

          if (timeUntilExpiry < 300) { // 5 minutos
            const { error: refreshError } = await supabase.auth.refreshSession()
            if (refreshError) {
              await signOut()
            }
          }
        }

      } catch (error) {
        await signOut()
      } finally {
        isValidatingRef.current = false
      }
    }

    // Validar imediatamente
    validateSession()

    // Configurar validação periódica (a cada 2 minutos)
    intervalRef.current = setInterval(validateSession, 2 * 60 * 1000)

    // Cleanup
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
      isValidatingRef.current = false
    }
  }, [user, signOut])

  // Validar sessão quando a aba volta ao foco
  useEffect(() => {
    const handleVisibilityChange = async () => {
      if (!document.hidden && user && !isValidatingRef.current) {
        isValidatingRef.current = true
        try {
          const { data: { session }, error } = await supabase.auth.getSession()

          if (error || !session) {
            await signOut()
          }
        } catch (error) {
          await signOut()
        } finally {
          isValidatingRef.current = false
        }
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [user, signOut])
}

export default useSessionValidator
