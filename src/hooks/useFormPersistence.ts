import { useEffect } from 'react'
import { DataPersistence } from '../services/DataPersistence'

export const useFormPersistence = <T>(
  key: string,
  data: T,
  options: { autoSave?: boolean; ttl?: number } = {}
) => {
  const { autoSave = true, ttl = 24 * 60 * 60 * 1000 } = options // 24 hours default

  useEffect(() => {
    if (autoSave && data) {
      const timeoutId = setTimeout(() => {
        DataPersistence.save(key, data, { ttl })
      }, 1000) // Debounce saves

      return () => clearTimeout(timeoutId)
    }
  }, [key, data, autoSave, ttl])

  const loadData = (): T | null => {
    return DataPersistence.load<T>(key, { ttl })
  }

  const saveData = (newData: T): boolean => {
    return DataPersistence.save(key, newData, { ttl })
  }

  const clearData = (): void => {
    DataPersistence.remove(key)
  }

  return {
    loadData,
    saveData,
    clearData
  }
}