import { useState, useEffect } from 'react'

function useDebounce<T>(value: T, delay: number): T {
  // Estado e setter para o valor debounced
  const [debouncedValue, setDebouncedValue] = useState<T>(value)

  useEffect(() => {
    // Atualiza o valor debounced após o delay
    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    // Cancela o timeout se value mudar (também na desmontagem)
    // Isso é como implementamos o debounce
    return () => {
      clearTimeout(handler)
    }
  }, [value, delay]) // Só re-executa se value ou delay mudarem

  return debouncedValue
}

export default useDebounce