interface ComponentConfig {
  name: string
  version: string
  dependencies: string[]
  props: Record<string, any>
  defaultProps: Record<string, any>
}

export class ComponentRegistry {
  private static components = new Map<string, ComponentConfig>()
  private static instances = new Map<string, any>()

  static register(config: ComponentConfig): void {
    this.components.set(config.name, config)
  }

  static get(name: string): ComponentConfig | undefined {
    return this.components.get(name)
  }

  static createInstance<T>(name: string, props: Record<string, any> = {}): T | null {
    const config = this.components.get(name)
    if (!config) return null

    const mergedProps = { ...config.defaultProps, ...props }
    const instanceKey = `${name}_${JSON.stringify(mergedProps)}`
    
    if (this.instances.has(instanceKey)) {
      return this.instances.get(instanceKey)
    }

    // Component factory logic would go here
    // For now, return null as this is a framework concept
    return null
  }

  static getAllComponents(): ComponentConfig[] {
    return Array.from(this.components.values())
  }

  static validateDependencies(name: string): boolean {
    const config = this.components.get(name)
    if (!config) return false

    return config.dependencies.every(dep => this.components.has(dep))
  }

  static getComponentTree(): Record<string, string[]> {
    const tree: Record<string, string[]> = {}
    
    this.components.forEach((config, name) => {
      tree[name] = config.dependencies
    })

    return tree
  }
}