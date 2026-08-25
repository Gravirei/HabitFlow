/**
 * Export Utility Functions
 * Handles CSV, JSON, and PDF export functionality
 */

import { format } from 'date-fns'
import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'
import type { ExportOptions } from './ExportModal'

export interface TimerSession {
  id: string
  mode: 'Stopwatch' | 'Countdown' | 'Intervals'
  duration: number // seconds
  timestamp: number
  sessionName?: string
  targetDuration?: number
  completed?: boolean
  intervals?: any[]
}

/**
 * Format duration in seconds to readable string
 */
export function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600)
  const mins = Math.floor((seconds % 3600) / 60)
  const secs = seconds % 60

  if (hours > 0) {
    return `${hours}h ${mins}m ${secs}s`
  } else if (mins > 0) {
    return `${mins}m ${secs}s`
  } else {
    return `${secs}s`
  }
}

/**
 * Calculate statistics from sessions
 */
export function calculateStats(sessions: TimerSession[]) {
  const totalDuration = sessions.reduce((sum, s) => sum + s.duration, 0)
  const totalSessions = sessions.length
  const avgDuration = totalSessions > 0 ? totalDuration / totalSessions : 0

  const byMode = sessions.reduce((acc, s) => {
    acc[s.mode] = (acc[s.mode] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  return {
    totalDuration,
    totalSessions,
    avgDuration,
    byMode,
    totalDurationFormatted: formatDuration(totalDuration),
    avgDurationFormatted: formatDuration(Math.round(avgDuration))
  }
}

/**
 * Export sessions as CSV
 */
export function exportToCSV(sessions: TimerSession[], options: ExportOptions): void {
  const stats = options.includeStats ? calculateStats(sessions) : null

  // CSV Header
  let csv = 'Date,Time,Mode,Duration,Session Name,Status\n'

  // Add data rows
  sessions.forEach(session => {
    const date = format(new Date(session.timestamp), 'yyyy-MM-dd')
    const time = format(new Date(session.timestamp), 'HH:mm:ss')
    const duration = formatDuration(session.duration)
    const sessionName = session.sessionName || '-'
    const status = session.completed === false ? 'Stopped' : 'Completed'

    csv += `${date},${time},${session.mode},"${duration}","${sessionName}",${status}\n`
  })

  // Add statistics at the end
  if (stats) {
    csv += '\n'
    csv += 'Statistics\n'
    csv += `Total Sessions,${stats.totalSessions}\n`
    csv += `Total Duration,${stats.totalDurationFormatted}\n`
    csv += `Average Duration,${stats.avgDurationFormatted}\n`
    csv += '\nSessions by Mode\n'
    Object.entries(stats.byMode).forEach(([mode, count]) => {
      csv += `${mode},${count}\n`
    })
  }

  // Download file
  downloadFile(csv, 'timer-history.csv', 'text/csv')
}

/**
 * Export sessions as JSON
 */
export function exportToJSON(sessions: TimerSession[], options: ExportOptions): void {
  const stats = options.includeStats ? calculateStats(sessions) : null

  const data = {
    exportDate: new Date().toISOString(),
    totalSessions: sessions.length,
    sessions: sessions.map(session => ({
      ...session,
      date: format(new Date(session.timestamp), 'yyyy-MM-dd'),
      time: format(new Date(session.timestamp), 'HH:mm:ss'),
      durationFormatted: formatDuration(session.duration)
    })),
    ...(stats && {
      statistics: {
        totalDuration: stats.totalDuration,
        totalDurationFormatted: stats.totalDurationFormatted,
        averageDuration: stats.avgDuration,
        averageDurationFormatted: stats.avgDurationFormatted,
        sessionsByMode: stats.byMode
      }
    })
  }

  const json = JSON.stringify(data, null, 2)
  downloadFile(json, 'timer-history.json', 'application/json')
}

/**
 * Capture chart as image using html2canvas
 */
async function captureChartAsImage(elementId: string): Promise<string | null> {
  try {
    const element = document.getElementById(elementId)
    if (!element) return null

    const canvas = await html2canvas(element, {
      backgroundColor: '#ffffff',
      scale: 2,
      logging: false,
      useCORS: true
    })

    return canvas.toDataURL('image/png')
  } catch (error) {
    console.error(`Failed to capture chart ${elementId}:`, error)
    return null
  }
}

/**
 * Export sessions as PDF with professional formatting and optional charts
 */
export async function exportToPDF(sessions: TimerSession[], options: ExportOptions): Promise<void> {
  const doc = new jsPDF()
  const stats = calculateStats(sessions)
  
  // Capture charts if requested (before generating PDF)
  let statisticsCards: string | null = null
  let timeSeriesChart: string | null = null
  let distributionChart: string | null = null
  let heatmapChart: string | null = null

  if (options.includeCharts) {
    console.log('📊 Capturing charts...')
    
    statisticsCards = await captureChartAsImage('statistics-cards')
    console.log('  • Statistics cards:', statisticsCards ? '✅ captured' : '❌ failed')
    
    timeSeriesChart = await captureChartAsImage('time-series-chart')
    console.log('  • Time series chart:', timeSeriesChart ? '✅ captured' : '❌ failed')
    
    distributionChart = await captureChartAsImage('distribution-chart')
    console.log('  • Distribution chart (donut):', distributionChart ? '✅ captured' : '❌ failed')
    
    heatmapChart = await captureChartAsImage('heatmap-chart')
    console.log('  • Heatmap chart:', heatmapChart ? '✅ captured' : '❌ failed')
  }
  
  const pageWidth = doc.internal.pageSize.getWidth()
  const pageHeight = doc.internal.pageSize.getHeight()
  const margin = 20
  let yPos = margin

  // Colors
  const primaryColor: [number, number, number] = [102, 126, 234] // Primary blue
  const darkGray: [number, number, number] = [51, 51, 51]
  const lightGray: [number, number, number] = [128, 128, 128]

  // Helper function to check if we need a new page
  const checkNewPage = (requiredSpace: number = 20) => {
    if (yPos + requiredSpace > pageHeight - margin) {
      doc.addPage()
      yPos = margin
      return true
    }
    return false
  }

  // Header
  doc.setFillColor(...primaryColor)
  doc.rect(0, 0, pageWidth, 40, 'F')
  
  doc.setTextColor(255, 255, 255)
  doc.setFontSize(24)
  doc.setFont('helvetica', 'bold')
  doc.text('Timer History Report', margin, 25)
  
  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  doc.text(`Generated: ${format(new Date(), 'MMMM dd, yyyy HH:mm')}`, margin, 33)

  yPos = 55

  // Statistics Section
  if (options.includeStats && stats) {
    doc.setTextColor(...darkGray)
    doc.setFontSize(16)
    doc.setFont('helvetica', 'bold')
    doc.text('Statistics Overview', margin, yPos)
    yPos += 10

    // Stats box
    doc.setDrawColor(...lightGray)
    doc.setLineWidth(0.5)
    doc.roundedRect(margin, yPos, pageWidth - 2 * margin, 40, 3, 3, 'S')

    doc.setFontSize(11)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(...primaryColor)
    
    const col1 = margin + 10
    const col2 = pageWidth / 2 + 10
    
    // Total Sessions
    doc.text('Total Sessions', col1, yPos + 12)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(...darkGray)
    doc.text(String(stats.totalSessions), col1, yPos + 20)

    // Total Duration
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(...primaryColor)
    doc.text('Total Duration', col2, yPos + 12)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(...darkGray)
    doc.text(stats.totalDurationFormatted, col2, yPos + 20)

    // Average Duration
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(...primaryColor)
    doc.text('Average Duration', col1, yPos + 30)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(...darkGray)
    doc.text(stats.avgDurationFormatted, col1, yPos + 38)

    yPos += 45

    // Sessions by Mode
    if (Object.keys(stats.byMode).length > 0) {
      checkNewPage(30)
      
      doc.setFontSize(12)
      doc.setFont('helvetica', 'bold')
      doc.setTextColor(...darkGray)
      doc.text('Sessions by Mode', margin, yPos)
      yPos += 8

      Object.entries(stats.byMode).forEach(([mode, count]) => {
        doc.setFontSize(10)
        doc.setFont('helvetica', 'normal')
        doc.setTextColor(...lightGray)
        doc.text(`${mode}:`, margin + 5, yPos)
        doc.setTextColor(...darkGray)
        doc.setFont('helvetica', 'bold')
        doc.text(String(count), margin + 50, yPos)
        yPos += 6
      })
      
      yPos += 10
    }
  }

  // Charts Section (if available and enabled)
  if (options.includeCharts && (statisticsCards || timeSeriesChart || distributionChart || heatmapChart)) {
    checkNewPage(40)
    
    doc.setFontSize(16)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(...darkGray)
    doc.text('Analytics Charts', margin, yPos)
    yPos += 12

    // Statistics Cards
    if (statisticsCards) {
      checkNewPage(50)
      
      doc.setFontSize(12)
      doc.setFont('helvetica', 'bold')
      doc.setTextColor(...darkGray)
      doc.text('Key Statistics', margin, yPos)
      yPos += 8

      const imgWidth = pageWidth - 2 * margin
      const imgHeight = 40
      
      doc.addImage(statisticsCards, 'PNG', margin, yPos, imgWidth, imgHeight)
      yPos += imgHeight + 15
    }

    // Time Series Chart
    if (timeSeriesChart) {
      checkNewPage(80)
      
      doc.setFontSize(12)
      doc.setFont('helvetica', 'bold')
      doc.setTextColor(...darkGray)
      doc.text('Time Trends', margin, yPos)
      yPos += 8

      const imgWidth = pageWidth - 2 * margin
      const imgHeight = 60
      
      doc.addImage(timeSeriesChart, 'PNG', margin, yPos, imgWidth, imgHeight)
      yPos += imgHeight + 15
    }

    // Distribution Chart
    if (distributionChart) {
      checkNewPage(70)
      
      doc.setFontSize(12)
      doc.setFont('helvetica', 'bold')
      doc.setTextColor(...darkGray)
      doc.text('Session Distribution', margin, yPos)
      yPos += 8

      const imgWidth = 70
      const imgHeight = 70
      const xPos = (pageWidth - imgWidth) / 2
      
      doc.addImage(distributionChart, 'PNG', xPos, yPos, imgWidth, imgHeight)
      yPos += imgHeight + 15
    }

    // Heatmap Chart
    if (heatmapChart) {
      checkNewPage(80)
      
      doc.setFontSize(12)
      doc.setFont('helvetica', 'bold')
      doc.setTextColor(...darkGray)
      doc.text('Activity Heatmap', margin, yPos)
      yPos += 8

      const imgWidth = pageWidth - 2 * margin
      const imgHeight = 60
      
      doc.addImage(heatmapChart, 'PNG', margin, yPos, imgWidth, imgHeight)
      yPos += imgHeight + 15
    }
  }

  // Session History Section
  checkNewPage(40)
  
  doc.setFontSize(16)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(...darkGray)
  doc.text('Session History', margin, yPos)
  yPos += 12

  // Session cards
  sessions.forEach((session, index) => {
    const cardHeight = session.sessionName ? 28 : 24
    checkNewPage(cardHeight + 5)

    // Session card background
    doc.setFillColor(245, 247, 250)
    doc.roundedRect(margin, yPos, pageWidth - 2 * margin, cardHeight, 2, 2, 'F')

    // Session number badge
    doc.setFillColor(...primaryColor)
    doc.circle(margin + 8, yPos + 10, 6, 'F')
    doc.setTextColor(255, 255, 255)
    doc.setFontSize(9)
    doc.setFont('helvetica', 'bold')
    doc.text(String(index + 1), margin + 8, yPos + 11, { align: 'center' })

    // Date and time
    doc.setFontSize(10)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(...darkGray)
    doc.text(
      format(new Date(session.timestamp), 'MMM dd, yyyy HH:mm'),
      margin + 20,
      yPos + 8
    )

    // Mode badge
    const modeColors: Record<string, [number, number, number]> = {
      Stopwatch: [34, 197, 94],
      Countdown: [239, 68, 68],
      Intervals: [249, 115, 22]
    }
    const modeColor = modeColors[session.mode] || primaryColor
    
    doc.setFillColor(...modeColor)
    doc.setTextColor(255, 255, 255)
    doc.setFontSize(8)
    doc.setFont('helvetica', 'bold')
    const modeWidth = doc.getTextWidth(session.mode) + 8
    doc.roundedRect(pageWidth - margin - modeWidth - 5, yPos + 4, modeWidth, 8, 2, 2, 'F')
    doc.text(session.mode, pageWidth - margin - modeWidth / 2 - 5, yPos + 9, { align: 'center' })

    // Duration
    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(...lightGray)
    doc.text('Duration:', margin + 20, yPos + 16)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(...darkGray)
    doc.text(formatDuration(session.duration), margin + 45, yPos + 16)

    // Session name (if exists)
    if (session.sessionName) {
      doc.setFont('helvetica', 'normal')
      doc.setTextColor(...lightGray)
      doc.text('Name:', margin + 20, yPos + 23)
      doc.setFont('helvetica', 'normal')
      doc.setTextColor(...darkGray)
      doc.text(session.sessionName, margin + 38, yPos + 23)
    }

    // Status
    const statusY = session.sessionName ? yPos + 23 : yPos + 16
    const status = session.completed === false ? 'Stopped' : 'Completed'
    const statusColor: [number, number, number] = session.completed === false ? [239, 68, 68] : [34, 197, 94]
    
    doc.setFillColor(...statusColor)
    doc.setTextColor(255, 255, 255)
    doc.setFontSize(7)
    doc.setFont('helvetica', 'bold')
    const statusWidth = doc.getTextWidth(status) + 6
    doc.roundedRect(pageWidth - margin - statusWidth - 5, statusY - 4, statusWidth, 7, 1.5, 1.5, 'F')
    doc.text(status, pageWidth - margin - statusWidth / 2 - 5, statusY, { align: 'center' })

    yPos += cardHeight + 5
  })

  // Footer
  // Type assertion for jsPDF internal API - this is safe as it's an official jsPDF property
  const totalPages = (doc as any).internal.pages.length - 1 // eslint-disable-line @typescript-eslint/no-explicit-any
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i)
    doc.setFontSize(8)
    doc.setTextColor(...lightGray)
    doc.setFont('helvetica', 'normal')
    doc.text(
      `Page ${i} of ${totalPages}`,
      pageWidth / 2,
      pageHeight - 10,
      { align: 'center' }
    )
  }

  // Save PDF
  doc.save('timer-history-report.pdf')
}

/**
 * Helper function to trigger file download
 */
function downloadFile(content: string, filename: string, mimeType: string): void {
  const blob = new Blob([content], { type: mimeType })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}
