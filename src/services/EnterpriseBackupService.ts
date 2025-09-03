interface BackupData {
  timestamp: string
  version: string
  userPreferences: Record<string, any>
  calculationHistory: any[]
  systemConfig: Record<string, any>
  auditLogs: any[]
}

export class EnterpriseBackupService {
  private static instance: EnterpriseBackupService
  private backupInterval: number = 300000 // 5 minutes
  private maxBackups: number = 10

  private constructor() {
    this.startAutoBackup()
  }

  static getInstance(): EnterpriseBackupService {
    if (!EnterpriseBackupService.instance) {
      EnterpriseBackupService.instance = new EnterpriseBackupService()
    }
    return EnterpriseBackupService.instance
  }

  // Create backup
  async createBackup(): Promise<string> {
    try {
      const backupData: BackupData = {
        timestamp: new Date().toISOString(),
        version: '0.1.0-pre',
        userPreferences: this.getUserPreferences(),
        calculationHistory: this.getCalculationHistory(),
        systemConfig: this.getSystemConfig(),
        auditLogs: this.getAuditLogs()
      }

      const backupId = `backup_${Date.now()}`
      const compressed = this.compressData(backupData)
      
      // Store locally
      localStorage.setItem(backupId, compressed)
      
      // Maintain backup limit
      this.cleanupOldBackups()
      
      return backupId
    } catch (error) {
      // Error logging disabled
      throw new Error('Failed to create backup')
    }
  }

  // Restore from backup
  async restoreBackup(backupId: string): Promise<boolean> {
    try {
      const compressed = localStorage.getItem(backupId)
      if (!compressed) {
        throw new Error('Backup not found')
      }

      const backupData = this.decompressData(compressed)
      
      // Restore user preferences
      this.restoreUserPreferences(backupData.userPreferences)
      
      // Restore system config
      this.restoreSystemConfig(backupData.systemConfig)
      
      return true
    } catch (error) {
      // Error logging disabled
      return false
    }
  }

  // List available backups
  getAvailableBackups(): Array<{
    id: string
    timestamp: string
    size: string
  }> {
    const backups: Array<{ id: string; timestamp: string; size: string }> = []
    
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key?.startsWith('backup_')) {
        const data = localStorage.getItem(key)
        if (data) {
          try {
            const backup = this.decompressData(data)
            backups.push({
              id: key,
              timestamp: backup.timestamp,
              size: this.formatBytes(data.length)
            })
          } catch {
            // Skip corrupted backups
          }
        }
      }
    }
    
    return backups.sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    )
  }

  // Auto backup
  private startAutoBackup(): void {
    setInterval(async () => {
      try {
        await this.createBackup()
        // Logging disabled
      } catch (error) {
        // Error logging disabled
      }
    }, this.backupInterval)
  }

  // Data collection methods
  private getUserPreferences(): Record<string, any> {
    const prefs: Record<string, any> = {}
    
    // Collect user preferences from localStorage
    const keys = ['darkMode', 'useMetric', 'useSliders', 'language']
    keys.forEach(key => {
      const value = localStorage.getItem(key)
      if (value) {
        try {
          prefs[key] = JSON.parse(value)
        } catch {
          prefs[key] = value
        }
      }
    })
    
    return prefs
  }

  private getCalculationHistory(): any[] {
    // Get recent calculations from localStorage
    const history: any[] = []
    
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key?.startsWith('calculation_')) {
        const data = localStorage.getItem(key)
        if (data) {
          try {
            history.push(JSON.parse(data))
          } catch {
            // Skip corrupted data
          }
        }
      }
    }
    
    return history.slice(-50) // Keep last 50 calculations
  }

  private getSystemConfig(): Record<string, any> {
    return {
      version: '0.1.0-pre',
      environment: process.env.NODE_ENV,
      timestamp: Date.now(),
      userAgent: navigator.userAgent
    }
  }

  private getAuditLogs(): any[] {
    const logs: any[] = []
    
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key?.startsWith('audit_')) {
        const data = localStorage.getItem(key)
        if (data) {
          try {
            logs.push(JSON.parse(data))
          } catch {
            // Skip corrupted logs
          }
        }
      }
    }
    
    return logs.slice(-100) // Keep last 100 audit logs
  }

  // Restoration methods
  private restoreUserPreferences(prefs: Record<string, any>): void {
    Object.entries(prefs).forEach(([key, value]) => {
      localStorage.setItem(key, JSON.stringify(value))
    })
  }

  private restoreSystemConfig(config: Record<string, any>): void {
    localStorage.setItem('systemConfig', JSON.stringify(config))
  }

  // Utility methods
  private compressData(data: BackupData): string {
    // Simple compression using JSON stringify
    return btoa(JSON.stringify(data))
  }

  private decompressData(compressed: string): BackupData {
    return JSON.parse(atob(compressed))
  }

  private formatBytes(bytes: number): string {
    if (bytes === 0) return '0 Bytes'
    
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  private cleanupOldBackups(): void {
    const backups = this.getAvailableBackups()
    
    if (backups.length > this.maxBackups) {
      const toDelete = backups.slice(this.maxBackups)
      toDelete.forEach(backup => {
        localStorage.removeItem(backup.id)
      })
    }
  }

  // Export backup
  exportBackup(backupId: string): void {
    const data = localStorage.getItem(backupId)
    if (!data) return

    const blob = new Blob([data], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${backupId}.backup`
    a.click()
    URL.revokeObjectURL(url)
  }

  // Import backup
  async importBackup(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      
      reader.onload = (e) => {
        try {
          const data = e.target?.result as string
          const backupId = `imported_${Date.now()}`
          localStorage.setItem(backupId, data)
          resolve(backupId)
        } catch (error) {
          reject(error)
        }
      }
      
      reader.onerror = () => reject(new Error('Failed to read file'))
      reader.readAsText(file)
    })
  }
}