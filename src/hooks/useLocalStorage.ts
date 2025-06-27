import { useState } from 'react'

function useLocalStorage<T>(key: string, initialValue: T) {
  // Estado para armazenar o valor
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      // Obter do localStorage local
      const item = window.localStorage.getItem(key)
      // Parse do JSON armazenado ou retorna o valor inicial
      return item ? JSON.parse(item) : initialValue
    } catch (error) {
      // Se erro, retorna o valor inicial
      return initialValue
    }
  })

  // Retorna uma versão wrapped da função setter do useState que persiste o novo valor no localStorage
  const setValue = (value: T | ((val: T) => T)) => {
    try {
      // Permite que value seja uma função para que tenhamos a mesma API do useState
      const valueToStore = value instanceof Function ? value(storedValue) : value
      // Salva no estado
      setStoredValue(valueToStore)
      // Salva no localStorage
      window.localStorage.setItem(key, JSON.stringify(valueToStore))
    } catch (error) {
      // Uma implementação mais avançada lidaria com o caso de localStorage estar cheio
      // Silently fail for localStorage errors
    }
  }

  return [storedValue, setValue] as const
}

export default useLocalStorage