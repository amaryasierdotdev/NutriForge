interface WorkflowStep {
  id: string
  name: string
  status: 'pending' | 'running' | 'completed' | 'failed' | 'skipped'
  startTime?: number
  endTime?: number
  result?: any
  error?: string
}

interface Workflow {
  id: string
  name: string
  steps: WorkflowStep[]
  status: 'pending' | 'running' | 'completed' | 'failed'
  progress: number
  startTime: number
  endTime?: number
}

export class EnterpriseWorkflowService {
  private static instance: EnterpriseWorkflowService
  private workflows: Map<string, Workflow> = new Map()
  private subscribers: Map<string, Array<(workflow: Workflow) => void>> = new Map()

  private constructor() {}

  static getInstance(): EnterpriseWorkflowService {
    if (!EnterpriseWorkflowService.instance) {
      EnterpriseWorkflowService.instance = new EnterpriseWorkflowService()
    }
    return EnterpriseWorkflowService.instance
  }

  // Create calculation workflow
  createCalculationWorkflow(metrics: any): string {
    const workflowId = `calc_${Date.now()}`
    const workflow: Workflow = {
      id: workflowId,
      name: 'Nutrition Calculation',
      status: 'pending',
      progress: 0,
      startTime: Date.now(),
      steps: [
        { id: 'validate', name: 'Validate Input', status: 'pending' },
        { id: 'calculate_bmr', name: 'Calculate BMR', status: 'pending' },
        { id: 'calculate_tdee', name: 'Calculate TDEE', status: 'pending' },
        { id: 'calculate_macros', name: 'Calculate Macros', status: 'pending' },
        { id: 'generate_recommendations', name: 'Generate Recommendations', status: 'pending' },
        { id: 'finalize', name: 'Finalize Results', status: 'pending' }
      ]
    }

    this.workflows.set(workflowId, workflow)
    return workflowId
  }

  // Execute workflow
  async executeWorkflow(workflowId: string, data: any): Promise<any> {
    const workflow = this.workflows.get(workflowId)
    if (!workflow) throw new Error('Workflow not found')

    workflow.status = 'running'
    this.notifySubscribers(workflowId, workflow)

    try {
      for (let i = 0; i < workflow.steps.length; i++) {
        const step = workflow.steps[i]
        await this.executeStep(step, data, workflow)
        
        workflow.progress = ((i + 1) / workflow.steps.length) * 100
        this.notifySubscribers(workflowId, workflow)
      }

      workflow.status = 'completed'
      workflow.endTime = Date.now()
      this.notifySubscribers(workflowId, workflow)

      return this.getWorkflowResult(workflow)
    } catch (error) {
      workflow.status = 'failed'
      workflow.endTime = Date.now()
      this.notifySubscribers(workflowId, workflow)
      throw error
    }
  }

  private async executeStep(step: WorkflowStep, data: any, workflow: Workflow): Promise<void> {
    step.status = 'running'
    step.startTime = Date.now()

    try {
      switch (step.id) {
        case 'validate':
          step.result = await this.validateInput(data)
          break
        case 'calculate_bmr':
          step.result = await this.calculateBMR(data)
          break
        case 'calculate_tdee':
          step.result = await this.calculateTDEE(data, workflow.steps[1].result)
          break
        case 'calculate_macros':
          step.result = await this.calculateMacros(data, workflow.steps[2].result)
          break
        case 'generate_recommendations':
          step.result = await this.generateRecommendations(data, workflow.steps[3].result)
          break
        case 'finalize':
          step.result = await this.finalizeResults(workflow)
          break
      }

      step.status = 'completed'
      step.endTime = Date.now()
    } catch (error) {
      step.status = 'failed'
      step.error = (error as Error).message
      step.endTime = Date.now()
      throw error
    }
  }

  // Step implementations
  private async validateInput(data: any): Promise<any> {
    await this.delay(200)
    if (!data.weight || !data.height || !data.age) {
      throw new Error('Missing required fields')
    }
    return { valid: true }
  }

  private async calculateBMR(data: any): Promise<number> {
    await this.delay(300)
    const { weight, height, age, gender } = data
    const bmr = gender === 'male' 
      ? 10 * weight + 6.25 * height - 5 * age + 5
      : 10 * weight + 6.25 * height - 5 * age - 161
    return bmr
  }

  private async calculateTDEE(data: any, bmr: number): Promise<number> {
    await this.delay(200)
    const multipliers = {
      sedentary: 1.35,
      lightlyActive: 1.65,
      moderatelyActive: 1.9,
      highlyActive: 2.1
    }
    return bmr * (multipliers[data.activityLevel as keyof typeof multipliers] || 1.35)
  }

  private async calculateMacros(data: any, tdee: number): Promise<any> {
    await this.delay(400)
    const protein = Math.round(data.weight * 2.2)
    return {
      bulk: { protein, calories: Math.round(tdee * 1.2) },
      cut: { protein: Math.round(protein * 1.2), calories: Math.round(tdee * 0.9) },
      maintain: { protein, calories: Math.round(tdee) }
    }
  }

  private async generateRecommendations(data: any, macros: any): Promise<string[]> {
    await this.delay(300)
    return [
      `Aim for ${macros.maintain.protein}g protein daily`,
      `Maintain ${macros.maintain.calories} calories for weight maintenance`,
      'Stay hydrated with 2.5-3L water daily',
      'Include resistance training 3-4x per week'
    ]
  }

  private async finalizeResults(workflow: Workflow): Promise<any> {
    await this.delay(100)
    return {
      workflowId: workflow.id,
      completedAt: Date.now(),
      duration: Date.now() - workflow.startTime
    }
  }

  // Subscription management
  subscribe(workflowId: string, callback: (workflow: Workflow) => void): () => void {
    if (!this.subscribers.has(workflowId)) {
      this.subscribers.set(workflowId, [])
    }
    this.subscribers.get(workflowId)!.push(callback)

    return () => {
      const subs = this.subscribers.get(workflowId)
      if (subs) {
        const index = subs.indexOf(callback)
        if (index > -1) subs.splice(index, 1)
      }
    }
  }

  private notifySubscribers(workflowId: string, workflow: Workflow): void {
    const subs = this.subscribers.get(workflowId)
    if (subs) {
      subs.forEach(callback => callback({ ...workflow }))
    }
  }

  // Utility methods
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  private getWorkflowResult(workflow: Workflow): any {
    return workflow.steps.reduce((result, step) => {
      if (step.result) {
        result[step.id] = step.result
      }
      return result
    }, {} as any)
  }

  getWorkflow(workflowId: string): Workflow | undefined {
    return this.workflows.get(workflowId)
  }

  getAllWorkflows(): Workflow[] {
    return Array.from(this.workflows.values())
  }
}