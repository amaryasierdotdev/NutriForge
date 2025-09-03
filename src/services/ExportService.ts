import { I18nService } from './i18n'

export class ExportService {
  static exportJSON(data: any, filename: string) {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    ExportService.downloadFile(blob, `${filename}.json`)
  }

  static exportCSV(data: any, filename: string) {
    const csv = ExportService.convertToCSV(data)
    const blob = new Blob([csv], { type: 'text/csv' })
    ExportService.downloadFile(blob, `${filename}.csv`)
  }

  static exportTXT(data: any, filename: string) {
    const content = ExportService.generateTXTContent(data)
    const blob = new Blob([content], { type: 'text/plain' })
    ExportService.downloadFile(blob, `${filename}.txt`)
  }

  static exportXML(data: any, filename: string) {
    const xml = ExportService.convertToXML(data)
    const blob = new Blob([xml], { type: 'application/xml' })
    ExportService.downloadFile(blob, `${filename}.xml`)
  }

  private static downloadFile(blob: Blob, filename: string) {
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    a.click()
    URL.revokeObjectURL(url)
  }

  private static convertToCSV(data: any): string {
    const rows = [
      ['Field', 'Value'],
      ['Client Name', data.client?.name || 'Anonymous'],
      ['Export Date', data.client?.exportDate || new Date().toISOString()],
      ['Report ID', data.client?.reportId || 'N/A'],
      ['', ''],
      ['INPUTS', ''],
      ...Object.entries(data.inputs || {}).map(([key, value]) => [key, value]),
      ['', ''],
      ['RESULTS', ''],
      ...Object.entries(data.results || {}).map(([key, value]) => [key, value]),
      ['', ''],
      ['NUTRITION', ''],
      ['Bulk Calories', data.nutrition?.bulk?.calories || 'N/A'],
      ['Cut Calories', data.nutrition?.cut?.calories || 'N/A'],
      ['Maintenance Calories', data.nutrition?.maintain?.calories || 'N/A']
    ]
    return rows.map(row => row.join(',')).join('\n')
  }

  private static convertToXML(data: any): string {
    return `<?xml version="1.0" encoding="UTF-8"?>
<body-recomposition-report>
  <client>
    <name>${data.client?.name || 'Anonymous'}</name>
    <exportDate>${data.client?.exportDate || new Date().toISOString()}</exportDate>
    <reportId>${data.client?.reportId || 'N/A'}</reportId>
    <version>${data.client?.version || '0.1.0-pre'}</version>
  </client>
  <inputs>
    ${Object.entries(data.inputs || {}).map(([key, value]) => 
      `<${key}>${value}</${key}>`
    ).join('\n    ')}
  </inputs>
  <results>
    ${Object.entries(data.results || {}).map(([key, value]) => 
      `<${key}>${value}</${key}>`
    ).join('\n    ')}
  </results>
  <nutrition>
    <bulk>
      ${Object.entries(data.nutrition?.bulk || {}).map(([key, value]) => 
        `<${key}>${value}</${key}>`
      ).join('\n      ')}
    </bulk>
    <cut>
      ${Object.entries(data.nutrition?.cut || {}).map(([key, value]) => 
        `<${key}>${value}</${key}>`
      ).join('\n      ')}
    </cut>
    <maintain>
      ${Object.entries(data.nutrition?.maintain || {}).map(([key, value]) => 
        `<${key}>${value}</${key}>`
      ).join('\n      ')}
    </maintain>
  </nutrition>
  <hydration>
    ${Object.entries(data.hydration || {}).map(([key, value]) => 
      `<${key}>${value}</${key}>`
    ).join('\n    ')}
  </hydration>
  <heartRate>
    ${Object.entries(data.heartRate || {}).map(([key, value]) => 
      `<${key}>${value}</${key}>`
    ).join('\n    ')}
  </heartRate>
</body-recomposition-report>`
  }

  private static generateTXTContent(data: any): string {
    const t = I18nService.t
    return `${t('app.title').toUpperCase()} - ${I18nService.t('tabs.nutritionAnalytics').toUpperCase()}
${'='.repeat(60)}

${I18nService.t('form.clientName').toUpperCase()}:
${I18nService.t('form.clientName')}: ${data.client?.name || I18nService.t('labels.anonymous')}
${I18nService.t('supplements.reportIssue')} ID: ${data.client?.reportId || 'N/A'}
${I18nService.t('messages.exported')}: ${data.client?.exportDate || new Date().toISOString()}

${I18nService.t('form.generateAnalysis').toUpperCase()}:
${'-'.repeat(40)}
${I18nService.t('form.gender')}: ${data.inputs?.gender || 'N/A'}
${I18nService.t('form.age')}: ${data.inputs?.age || 'N/A'}
${I18nService.t('form.weight')}: ${data.inputs?.weight || 'N/A'}
${I18nService.t('form.height')}: ${data.inputs?.height || 'N/A'}
${I18nService.t('form.bodyFat')}: ${data.inputs?.bodyFatPercentage || 'N/A'}
${I18nService.t('form.activityLevel')}: ${data.inputs?.activityLevel || 'N/A'}

${I18nService.t('tabs.biometricAnalysis').toUpperCase()}:
${'-'.repeat(40)}
${I18nService.t('results.bmr')}: ${data.results?.bmr || 'N/A'}
${I18nService.t('results.tdee')}: ${data.results?.tdee || 'N/A'}
${I18nService.t('results.bmi')}: ${data.results?.bmi || 'N/A'}
${I18nService.t('results.leanMass')}: ${data.results?.leanBodyMass || 'N/A'}

${I18nService.t('tabs.nutritionAnalytics').toUpperCase()}:
${'-'.repeat(40)}
${I18nService.t('nutrition.bulk').toUpperCase()}:
  ${I18nService.t('nutrition.protein')}: ${data.nutrition?.bulk?.protein || 'N/A'}
  ${I18nService.t('nutrition.fat')}: ${data.nutrition?.bulk?.fat || 'N/A'}
  ${I18nService.t('nutrition.carbs')}: ${data.nutrition?.bulk?.carbs || 'N/A'}

${I18nService.t('nutrition.cut').toUpperCase()}:
  ${I18nService.t('nutrition.protein')}: ${data.nutrition?.cut?.protein || 'N/A'}
  ${I18nService.t('nutrition.fat')}: ${data.nutrition?.cut?.fat || 'N/A'}
  ${I18nService.t('nutrition.carbs')}: ${data.nutrition?.cut?.carbs || 'N/A'}

${I18nService.t('nutrition.maintain').toUpperCase()}:
  ${I18nService.t('nutrition.protein')}: ${data.nutrition?.maintain?.protein || 'N/A'}
  ${I18nService.t('nutrition.fat')}: ${data.nutrition?.maintain?.fat || 'N/A'}
  ${I18nService.t('nutrition.carbs')}: ${data.nutrition?.maintain?.carbs || 'N/A'}

${I18nService.t('hydration.title').toUpperCase()}:
${'-'.repeat(40)}
${I18nService.t('hydration.regularDays')}: ${data.hydration?.maintenance || 'N/A'}
${I18nService.t('hydration.trainingDays')}: ${data.hydration?.training || 'N/A'}

${I18nService.t('heartRate.title').toUpperCase()}:
${'-'.repeat(40)}
${I18nService.t('heartRate.maximum')}: ${data.heartRate?.maximum || 'N/A'}
${I18nService.t('heartRate.liss')}: ${data.heartRate?.liss || 'N/A'}

${'='.repeat(60)}
${I18nService.t('app.subtitle')}
© 2025`
  }
}