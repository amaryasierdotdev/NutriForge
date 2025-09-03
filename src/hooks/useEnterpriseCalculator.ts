import { useState, useCallback } from 'react'
import { NutritionCalculatorService } from '../services/NutritionCalculatorService'
import { UserMetrics, CalculationResults } from '../types'

interface EnterpriseCalculatorState {
  results: CalculationResults | null
  loading: boolean
  error: string | null
}

export const useEnterpriseCalculator = () => {
  const [state, setState] = useState<EnterpriseCalculatorState>({
    results: null,
    loading: false,
    error: null
  })

  const calculate = useCallback(async (metrics: UserMetrics) => {
    setState(prev => ({ ...prev, loading: true, error: null }))

    try {
      const calculatorService = new NutritionCalculatorService()
      const results = calculatorService.calculateNutrition(metrics)
      
      setState(prev => ({
        ...prev,
        results,
        loading: false
      }))

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Calculation failed'
      setState(prev => ({
        ...prev,
        error: errorMessage,
        loading: false
      }))
    }
  }, [])

  const reset = useCallback(() => {
    setState({
      results: null,
      loading: false,
      error: null
    })
  }, [])

  return {
    ...state,
    calculate,
    reset
  }
}