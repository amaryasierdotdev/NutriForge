import { useState, useCallback, useRef } from 'react'

export const useOptimizedState = <T>(initialValue: T) => {
  const [state, setState] = useState<T>(initialValue)
  const stateRef = useRef<T>(initialValue)

  const optimizedSetState = useCallback((newValue: T | ((prev: T) => T)) => {
    const nextValue = typeof newValue === 'function' 
      ? (newValue as (prev: T) => T)(stateRef.current)
      : newValue

    if (JSON.stringify(nextValue) !== JSON.stringify(stateRef.current)) {
      stateRef.current = nextValue
      setState(nextValue)
    }
  }, [])

  const getCurrentState = useCallback(() => stateRef.current, [])

  return [state, optimizedSetState, getCurrentState] as const
}