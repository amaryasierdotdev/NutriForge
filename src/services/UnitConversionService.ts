export class UnitConversionService {
  // Weight conversions
  static lbsToKg(lbs: number): number {
    return lbs * 0.453592
  }

  static kgToLbs(kg: number): number {
    return kg / 0.453592
  }

  // Height conversions
  static feetToInches(feet: number): number {
    const wholeFeet = Math.floor(feet)
    const inches = (feet - wholeFeet) * 12
    return wholeFeet * 12 + inches
  }

  static inchesToCm(inches: number): number {
    return inches * 2.54
  }

  static feetToCm(feet: number): number {
    const totalInches = this.feetToInches(feet)
    return this.inchesToCm(totalInches)
  }

  static cmToFeet(cm: number): number {
    const totalInches = cm / 2.54
    return totalInches / 12
  }

  // Combined conversions for the app
  static convertWeightToMetric(weight: number, isMetric: boolean): number {
    return isMetric ? weight : this.lbsToKg(weight)
  }

  static convertHeightToMetric(height: number, isMetric: boolean): number {
    return isMetric ? height : this.feetToCm(height)
  }

  // Validation ranges for imperial units
  static getWeightRange(isMetric: boolean): { min: number; max: number } {
    if (isMetric) {
      return { min: 30, max: 300 } // kg
    } else {
      return { min: 66, max: 661 } // lbs (30kg to 300kg converted)
    }
  }

  static getHeightRange(isMetric: boolean): { min: number; max: number } {
    if (isMetric) {
      return { min: 120, max: 250 } // cm
    } else {
      return { min: 3.9, max: 8.2 } // feet (120cm to 250cm converted)
    }
  }
}