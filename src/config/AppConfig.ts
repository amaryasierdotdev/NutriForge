export const AppConfig = {
  app: {
    name: 'Body Recomposition Calculator',
    version: '0.1.0-pre',
    author: 'Amar Yasier',
    description: 'Professional nutrition planning made simple'
  },
  
  api: {
    baseUrl: process.env.REACT_APP_API_URL || '',
    timeout: 10000,
    retryAttempts: 3
  },
  
  features: {
    advancedMode: true,
    exportFormats: ['JSON', 'CSV', 'XML', 'PDF'],
    darkMode: true,
    notifications: true
  },
  
  validation: {
    age: { min: 16, max: 80 },
    weight: { min: 30, max: 300 },
    height: { min: 120, max: 250 },
    bodyFat: { 
      male: { min: 10, max: 20 }, 
      female: { min: 18, max: 28 } 
    }
  },
  
  calculations: {
    bmr: {
      male: { base: 10, weightMultiplier: 6.25, ageMultiplier: 5, constant: 5 },
      female: { base: 10, weightMultiplier: 6.25, ageMultiplier: 5, constant: -161 }
    },
    activityMultipliers: {
      sedentary: 1.35,
      lightlyActive: 1.65,
      moderatelyActive: 1.9,
      highlyActive: 2.1
    }
  },
  
  ui: {
    animations: {
      duration: 300,
      easing: 'cubic-bezier(0.4, 0, 0.2, 1)'
    },
    breakpoints: {
      mobile: 768,
      tablet: 1024,
      desktop: 1200
    }
  }
}