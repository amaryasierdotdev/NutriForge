import { useState, useCallback } from 'react'

export type InputMode = 'keyboard' | 'touch' | 'voice'

export const useInputMode = () => {
  const [inputMode, setInputMode] = useState<InputMode>('keyboard')

  const switchMode = useCallback((mode: InputMode) => {
    setInputMode(mode)
  }, [])

  const toggleMode = useCallback(() => {
    setInputMode(prev => {
      switch (prev) {
        case 'keyboard': return 'touch'
        case 'touch': return 'voice'
        case 'voice': return 'keyboard'
        default: return 'keyboard'
      }
    })
  }, [])

  return {
    inputMode,
    switchMode,
    toggleMode,
    isKeyboard: inputMode === 'keyboard',
    isTouch: inputMode === 'touch',
    isVoice: inputMode === 'voice'
  }
}