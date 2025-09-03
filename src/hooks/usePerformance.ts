import { useCallback, useMemo } from 'react'

export const usePerformance = () => {
  const debounce = useCallback((func: Function, delay: number) => {
    let timeoutId: NodeJS.Timeout
    return (...args: any[]) => {
      clearTimeout(timeoutId)
      timeoutId = setTimeout(() => func.apply(null, args), delay)
    }
  }, [])

  const throttle = useCallback((func: Function, limit: number) => {
    let inThrottle: boolean
    return (...args: any[]) => {
      if (!inThrottle) {
        func.apply(null, args)
        inThrottle = true
        setTimeout(() => inThrottle = false, limit)
      }
    }
  }, [])

  const memoizedCalculation = useMemo(() => ({
    calculateBMR: (weight: number, height: number, age: number, gender: 'male' | 'female') => {
      const base = 10 * weight + 6.25 * height - 5 * age
      return gender === 'male' ? base + 5 : base - 161
    },
    calculateTDEE: (bmr: number, activityLevel: string) => {
      const multipliers = { sedentary: 1.35, lightlyActive: 1.65, moderatelyActive: 1.9, highlyActive: 2.1 }
      return bmr * (multipliers[activityLevel as keyof typeof multipliers] || 1.35)
    }
  }), [])

  return { debounce, throttle, memoizedCalculation }
}