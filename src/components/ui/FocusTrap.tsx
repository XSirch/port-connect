import React, { useEffect, useRef } from 'react'

interface FocusTrapProps {
  children: React.ReactNode
  active?: boolean
  restoreFocus?: boolean
}

const FocusTrap: React.FC<FocusTrapProps> = ({ 
  children, 
  active = true, 
  restoreFocus = true 
}) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const previousActiveElement = useRef<Element | null>(null)

  useEffect(() => {
    if (!active) return

    // Salva o elemento ativo atual
    previousActiveElement.current = document.activeElement

    const container = containerRef.current
    if (!container) return

    // Encontra todos os elementos focáveis
    const focusableElements = container.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    )

    const firstElement = focusableElements[0] as HTMLElement
    const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement

    // Foca no primeiro elemento
    if (firstElement) {
      firstElement.focus()
    }

    const handleTabKey = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return

      if (e.shiftKey) {
        // Shift + Tab
        if (document.activeElement === firstElement) {
          e.preventDefault()
          lastElement?.focus()
        }
      } else {
        // Tab
        if (document.activeElement === lastElement) {
          e.preventDefault()
          firstElement?.focus()
        }
      }
    }

    document.addEventListener('keydown', handleTabKey)

    return () => {
      document.removeEventListener('keydown', handleTabKey)
      
      // Restaura o foco para o elemento anterior
      if (restoreFocus && previousActiveElement.current) {
        (previousActiveElement.current as HTMLElement).focus()
      }
    }
  }, [active, restoreFocus])

  return (
    <div ref={containerRef}>
      {children}
    </div>
  )
}

export default FocusTrap