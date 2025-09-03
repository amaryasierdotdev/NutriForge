# Hydration Calculation Explained

## Overview
The hydration calculation in NutriForge Pro provides personalized water intake recommendations based on your Total Daily Energy Expenditure (TDEE) and body weight.

## How It Works

### Base Calculation
```javascript
const getHydration = () => {
  const baseline = results.bodyComposition.tdee / 1000
  const preWorkout = (Number(formData.weight) * 5) / 1000
  const intraWorkout = 0.4
  const postWorkout = 1.25
  
  return {
    maintenance: baseline,
    training: baseline + preWorkout + intraWorkout + postWorkout,
    pre: preWorkout,
    intra: intraWorkout,
    post: postWorkout,
  }
}
```

### Breakdown

#### 1. **Maintenance Days (Regular Days)**
- **Formula**: `TDEE ÷ 1000`
- **Logic**: For every 1000 calories you burn, you need approximately 1 liter of water
- **Example**: If TDEE = 2500 calories → 2.5L water needed

#### 2. **Training Days**
- **Formula**: `Maintenance + Pre-workout + Intra-workout + Post-workout`
- **Components**:
  - **Pre-workout**: `(Body Weight × 5ml) ÷ 1000` = Body weight × 0.005L
  - **Intra-workout**: Fixed 0.4L (400ml)
  - **Post-workout**: Fixed 1.25L

#### 3. **Workout-Specific Hydration**
- **Pre-workout**: 5ml per kg of body weight (helps with performance)
- **Intra-workout**: 400ml (replaces sweat losses during exercise)
- **Post-workout**: 1.25L (rehydration and recovery)

## Example Calculation

For a 75kg person with TDEE of 2625 calories:

- **Maintenance**: 2625 ÷ 1000 = **2.63L**
- **Pre-workout**: (75 × 5) ÷ 1000 = **0.38L**
- **Intra-workout**: **0.4L**
- **Post-workout**: **1.25L**
- **Training Day Total**: 2.63 + 0.38 + 0.4 + 1.25 = **4.66L**

## Scientific Basis

1. **TDEE-based hydration** accounts for metabolic water needs
2. **Pre-workout hydration** optimizes performance and prevents dehydration
3. **Intra-workout fluid** replaces immediate sweat losses
4. **Post-workout volume** ensures complete rehydration and supports recovery

## Notes

- These are baseline recommendations
- Individual needs may vary based on:
  - Climate and temperature
  - Sweat rate
  - Exercise intensity and duration
  - Overall health status
- Always listen to your body and adjust accordingly