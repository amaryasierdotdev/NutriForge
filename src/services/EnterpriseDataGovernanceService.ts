interface DataClassification {
  level: 'public' | 'internal' | 'confidential' | 'restricted'
  retention: number // days
  encryption: boolean
  anonymization: boolean
}

interface DataPolicy {
  id: string
  name: string
  description: string
  classification: DataClassification
  rules: string[]
  compliance: string[]
}

interface DataLineage {
  dataId: string
  source: string
  transformations: Array<{
    step: string
    timestamp: number
    operation: string
  }>
  destination: string
  created: number
  lastModified: number
}

export class EnterpriseDataGovernanceService {
  private static instance: EnterpriseDataGovernanceService
  private policies: Map<string, DataPolicy> = new Map()
  private lineage: Map<string, DataLineage> = new Map()
  private classifications: Map<string, DataClassification> = new Map()

  private constructor() {
    this.initializePolicies()
  }

  static getInstance(): EnterpriseDataGovernanceService {
    if (!EnterpriseDataGovernanceService.instance) {
      EnterpriseDataGovernanceService.instance = new EnterpriseDataGovernanceService()
    }
    return EnterpriseDataGovernanceService.instance
  }

  private initializePolicies(): void {
    // Personal Health Information
    this.policies.set('phi', {
      id: 'phi',
      name: 'Personal Health Information',
      description: 'Health and biometric data requiring HIPAA compliance',
      classification: {
        level: 'restricted',
        retention: 2555, // 7 years
        encryption: true,
        anonymization: true
      },
      rules: [
        'Must be encrypted at rest and in transit',
        'Access requires explicit consent',
        'Audit all access attempts',
        'Anonymize for analytics'
      ],
      compliance: ['HIPAA', 'GDPR', 'CCPA']
    })

    // Personal Identifiable Information
    this.policies.set('pii', {
      id: 'pii',
      name: 'Personal Identifiable Information',
      description: 'Data that can identify individuals',
      classification: {
        level: 'confidential',
        retention: 1095, // 3 years
        encryption: true,
        anonymization: true
      },
      rules: [
        'Minimize collection to necessary data only',
        'Obtain explicit consent',
        'Provide data portability',
        'Honor deletion requests'
      ],
      compliance: ['GDPR', 'CCPA', 'PIPEDA']
    })

    // Analytics Data
    this.policies.set('analytics', {
      id: 'analytics',
      name: 'Analytics Data',
      description: 'Aggregated usage and performance data',
      classification: {
        level: 'internal',
        retention: 365, // 1 year
        encryption: false,
        anonymization: true
      },
      rules: [
        'Anonymize all personal identifiers',
        'Aggregate data for reporting',
        'No individual tracking'
      ],
      compliance: ['GDPR']
    })
  }

  // Data classification
  classifyData(dataType: string, content: any): DataClassification {
    if (this.containsHealthData(content)) {
      return this.policies.get('phi')!.classification
    }
    
    if (this.containsPII(content)) {
      return this.policies.get('pii')!.classification
    }
    
    return this.policies.get('analytics')!.classification
  }

  // Data processing with governance
  processData(dataId: string, data: any, operation: string): any {
    const classification = this.classifyData('user_metrics', data)
    const lineage = this.getOrCreateLineage(dataId, 'user_input')

    // Add transformation step
    lineage.transformations.push({
      step: `process_${operation}`,
      timestamp: Date.now(),
      operation
    })

    // Apply governance rules
    let processedData = { ...data }

    if (classification.anonymization) {
      processedData = this.anonymizeData(processedData)
    }

    if (classification.encryption) {
      processedData = this.encryptSensitiveFields(processedData)
    }

    // Update lineage
    lineage.lastModified = Date.now()
    this.lineage.set(dataId, lineage)

    return processedData
  }

  // Data retention management
  enforceRetentionPolicies(): void {
    const now = Date.now()
    
    this.lineage.forEach((lineage, dataId) => {
      const classification = this.classifications.get(dataId)
      if (!classification) return

      const retentionMs = classification.retention * 24 * 60 * 60 * 1000
      const expiryTime = lineage.created + retentionMs

      if (now > expiryTime) {
        this.deleteData(dataId)
      }
    })
  }

  // Data anonymization
  private anonymizeData(data: any): any {
    const anonymized = { ...data }
    
    // Remove direct identifiers
    delete anonymized.name
    delete anonymized.email
    delete anonymized.phone
    
    // Hash sensitive fields
    if (anonymized.userId) {
      anonymized.userId = this.hashValue(anonymized.userId)
    }
    
    // Generalize specific values
    if (anonymized.age) {
      anonymized.ageGroup = this.getAgeGroup(anonymized.age)
      delete anonymized.age
    }
    
    return anonymized
  }

  // Encryption for sensitive fields
  private encryptSensitiveFields(data: any): any {
    const encrypted = { ...data }
    const sensitiveFields = ['weight', 'height', 'bodyFatPercentage']
    
    sensitiveFields.forEach(field => {
      if (encrypted[field]) {
        encrypted[field] = this.encrypt(String(encrypted[field]))
      }
    })
    
    return encrypted
  }

  // Data lineage tracking
  private getOrCreateLineage(dataId: string, source: string): DataLineage {
    if (this.lineage.has(dataId)) {
      return this.lineage.get(dataId)!
    }
    
    const lineage: DataLineage = {
      dataId,
      source,
      transformations: [],
      destination: 'processing',
      created: Date.now(),
      lastModified: Date.now()
    }
    
    this.lineage.set(dataId, lineage)
    return lineage
  }

  // Compliance reporting
  generateComplianceReport(): {
    policies: number
    dataAssets: number
    retentionCompliance: number
    encryptionCompliance: number
    violations: string[]
  } {
    const violations: string[] = []
    let retentionCompliant = 0
    let encryptionCompliant = 0
    
    this.lineage.forEach((lineage, dataId) => {
      const classification = this.classifications.get(dataId)
      if (!classification) return
      
      // Check retention compliance
      const age = Date.now() - lineage.created
      const retentionMs = classification.retention * 24 * 60 * 60 * 1000
      
      if (age <= retentionMs) {
        retentionCompliant++
      } else {
        violations.push(`Data ${dataId} exceeds retention period`)
      }
      
      // Check encryption compliance
      if (classification.encryption) {
        encryptionCompliant++
      }
    })
    
    return {
      policies: this.policies.size,
      dataAssets: this.lineage.size,
      retentionCompliance: Math.round((retentionCompliant / this.lineage.size) * 100),
      encryptionCompliance: Math.round((encryptionCompliant / this.lineage.size) * 100),
      violations
    }
  }

  // Data subject rights (GDPR)
  handleDataSubjectRequest(type: 'access' | 'portability' | 'deletion', userId: string): any {
    const userDataIds = Array.from(this.lineage.keys()).filter(id => 
      id.includes(userId) || this.lineage.get(id)?.source.includes(userId)
    )
    
    switch (type) {
      case 'access':
        return this.exportUserData(userDataIds)
      case 'portability':
        return this.exportUserDataPortable(userDataIds)
      case 'deletion':
        return this.deleteUserData(userDataIds)
    }
  }

  // Utility methods
  private containsHealthData(data: any): boolean {
    const healthFields = ['weight', 'height', 'bodyFatPercentage', 'bloodPressure', 'heartRate']
    return healthFields.some(field => data[field] !== undefined)
  }

  private containsPII(data: any): boolean {
    const piiFields = ['name', 'email', 'phone', 'address', 'ssn']
    return piiFields.some(field => data[field] !== undefined)
  }

  private hashValue(value: string): string {
    // Simple hash for demo - use proper crypto in production
    let hash = 0
    for (let i = 0; i < value.length; i++) {
      const char = value.charCodeAt(i)
      hash = ((hash << 5) - hash) + char
      hash = hash & hash // Convert to 32-bit integer
    }
    return `hash_${Math.abs(hash)}`
  }

  private getAgeGroup(age: number): string {
    if (age < 25) return '18-24'
    if (age < 35) return '25-34'
    if (age < 45) return '35-44'
    if (age < 55) return '45-54'
    return '55+'
  }

  private encrypt(value: string): string {
    // Simple encryption for demo - use proper crypto in production
    return btoa(value)
  }

  private deleteData(dataId: string): void {
    this.lineage.delete(dataId)
    this.classifications.delete(dataId)
  }

  private exportUserData(dataIds: string[]): any {
    return dataIds.map(id => ({
      id,
      lineage: this.lineage.get(id),
      classification: this.classifications.get(id)
    }))
  }

  private exportUserDataPortable(dataIds: string[]): string {
    const data = this.exportUserData(dataIds)
    return JSON.stringify(data, null, 2)
  }

  private deleteUserData(dataIds: string[]): { deleted: number } {
    dataIds.forEach(id => this.deleteData(id))
    return { deleted: dataIds.length }
  }
}