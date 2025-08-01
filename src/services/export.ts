import * as XLSX from 'xlsx'
import { saveAs } from 'file-saver'
import { format } from 'date-fns'
import type { PresensiRecord } from '@/stores/presensi'

export class ExportService {
  exportToExcel(records: PresensiRecord[], filename?: string): void {
    const data = records.map((record) => ({
      Tanggal: record.date,
      Nama: record.user_name,
      Status: record.status,
      'Check In': record.check_in_time || '-',
      'Check Out': record.check_out_time || '-',
      'Lokasi Check In': record.check_in_location
        ? `${record.check_in_location.lat}, ${record.check_in_location.lng}`
        : '-',
      'Lokasi Check Out': record.check_out_location
        ? `${record.check_out_location.lat}, ${record.check_out_location.lng}`
        : '-',
    }))

    const worksheet = XLSX.utils.json_to_sheet(data)
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Presensi')

    // Auto-width columns
    const colWidths = Object.keys(data[0] || {}).map((key) => ({
      wch: Math.max(key.length, ...data.map((row) => String(row[key as keyof typeof row]).length)),
    }))
    worksheet['!cols'] = colWidths

    const buffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' })
    const blob = new Blob([buffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    })

    const defaultFilename = `presensi-${format(new Date(), 'yyyy-MM-dd')}.xlsx`
    saveAs(blob, filename || defaultFilename)
  }

  exportToCSV(records: PresensiRecord[], filename?: string): void {
    const headers = [
      'Tanggal',
      'Nama',
      'Status',
      'Check In',
      'Check Out',
      'Lokasi Check In',
      'Lokasi Check Out',
    ]

    const csvContent = [
      headers.join(','),
      ...records.map((record) =>
        [
          record.date,
          record.user_name,
          record.status,
          record.check_in_time || '-',
          record.check_out_time || '-',
          record.check_in_location ? `"${record.check_in_location.lat}, ${record.check_in_location.lng}"` : '-',
          record.check_out_location
            ? `"${record.check_out_location.lat}, ${record.check_out_location.lng}"`
            : '-',
        ].join(','),
      ),
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const defaultFilename = `presensi-${format(new Date(), 'yyyy-MM-dd')}.csv`
    saveAs(blob, filename || defaultFilename)
  }

  generateQRCode(data: string): Promise<string> {
    return import('qrcode').then((QRCode) => {
      return QRCode.toDataURL(data)
    })
  }

  async generateAttendanceQR(userId: string, date: string): Promise<string> {
    const qrData = JSON.stringify({
      userId,
      date,
      timestamp: Date.now(),
      type: 'attendance',
    })

    return this.generateQRCode(qrData)
  }

  printReport(records: PresensiRecord[]): void {
    const printContent = `
      <html>
        <head>
          <title>Laporan Presensi</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            h1 { text-align: center; color: #333; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #f2f2f2; font-weight: bold; }
            .summary { margin-bottom: 20px; }
          </style>
        </head>
        <body>
          <h1>Laporan Presensi</h1>
          <div class="summary">
            <p><strong>Total Records:</strong> ${records.length}</p>
            <p><strong>Generated:</strong> ${format(new Date(), 'dd/MM/yyyy HH:mm:ss')}</p>
          </div>
          <table>
            <thead>
              <tr>
                <th>Tanggal</th>
                <th>Nama</th>
                <th>Status</th>
                <th>Check In</th>
                <th>Check Out</th>
              </tr>
            </thead>
            <tbody>
              ${records
                .map(
                  (record) => `
                <tr>
                  <td>${record.date}</td>
                  <td>${record.user_name}</td>
                  <td>${record.status}</td>
                  <td>${record.check_in_time || '-'}</td>
                  <td>${record.check_out_time || '-'}</td>
                </tr>
              `,
                )
                .join('')}
            </tbody>
          </table>
        </body>
      </html>
    `

    const printWindow = window.open('', '_blank')
    if (printWindow) {
      printWindow.document.write(printContent)
      printWindow.document.close()
      printWindow.print()
    }
  }
}

export const exportService = new ExportService()
