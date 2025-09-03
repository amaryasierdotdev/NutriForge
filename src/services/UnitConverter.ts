export class UnitConverter {
  // Weight conversions
  static kgToLbs(kg: number): number {
    return kg * 2.20462
  }

  static lbsToKg(lbs: number): number {
    return lbs / 2.20462
  }

  // Height conversions
  static cmToFeet(cm: number): { feet: number; inches: number } {
    const totalInches = cm / 2.54
    const feet = Math.floor(totalInches / 12)
    const inches = Math.round(totalInches % 12)
    return { feet, inches }
  }

  static feetToCm(feet: number, inches: number = 0): number {
    return (feet * 12 + inches) * 2.54
  }

  // Protein calculations based on body weight
  static calculateProtein(weightKg: number, goal: 'bulk' | 'cut' | 'maintain', isMetric: boolean = true): number {
    const weightLbs = isMetric ? this.kgToLbs(weightKg) : weightKg
    
    switch (goal) {
      case 'bulk':
        return Math.round(weightLbs * 0.85) // Average of 1g/lb to 0.7g/lb
      case 'cut':
        return Math.round(weightLbs * 1.0) // Average of 1.2g/lb to 0.8g/lb
      case 'maintain':
        return Math.round(weightLbs * 0.7) // 0.7g/lb
      default:
        return Math.round(weightLbs * 0.8)
    }
  }

  static formatWeight(weight: number, isMetric: boolean): string {
    return isMetric ? `${weight} kg` : `${Math.round(this.kgToLbs(weight))} lbs`
  }

  static formatHeight(height: number, isMetric: boolean): string {
    if (isMetric) {
      return `${height} cm`
    } else {
      const { feet, inches } = this.cmToFeet(height)
      return `${feet}'${inches}"`
    }
  }
}