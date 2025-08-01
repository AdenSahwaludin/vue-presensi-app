export class NotificationService {
  private permission: NotificationPermission = 'default'

  async requestPermission(): Promise<boolean> {
    if (!('Notification' in window)) {
      console.warn('This browser does not support notifications')
      return false
    }

    if (this.permission === 'granted') {
      return true
    }

    this.permission = await Notification.requestPermission()
    return this.permission === 'granted'
  }

  async show(title: string, options?: NotificationOptions): Promise<void> {
    const hasPermission = await this.requestPermission()

    if (!hasPermission) {
      console.warn('Notification permission denied')
      return
    }

    const notification = new Notification(title, {
      icon: '/favicon.ico',
      badge: '/favicon.ico',
      ...options,
    })

    // Auto close after 5 seconds
    setTimeout(() => {
      notification.close()
    }, 5000)
  }

  async showCheckInReminder(): Promise<void> {
    await this.show('Reminder Presensi', {
      body: 'Jangan lupa untuk check-in hari ini!',
      tag: 'checkin-reminder',
    })
  }

  async showCheckOutReminder(): Promise<void> {
    await this.show('Reminder Check-out', {
      body: 'Jangan lupa untuk check-out sebelum pulang!',
      tag: 'checkout-reminder',
    })
  }

  async showSuccessMessage(message: string): Promise<void> {
    await this.show('Presensi Berhasil', {
      body: message,
      tag: 'success',
    })
  }

  scheduleReminders(): void {
    // Check-in reminder at 8:30 AM
    this.scheduleNotification('08:30', () => {
      this.showCheckInReminder()
    })

    // Check-out reminder at 5:00 PM
    this.scheduleNotification('17:00', () => {
      this.showCheckOutReminder()
    })
  }

  private scheduleNotification(time: string, callback: () => void): void {
    const [hours, minutes] = time.split(':').map(Number)
    const now = new Date()
    const targetTime = new Date()
    targetTime.setHours(hours, minutes, 0, 0)

    // If target time has passed today, schedule for tomorrow
    if (targetTime < now) {
      targetTime.setDate(targetTime.getDate() + 1)
    }

    const timeout = targetTime.getTime() - now.getTime()

    setTimeout(() => {
      callback()
      // Schedule for next day
      setTimeout(() => this.scheduleNotification(time, callback), 24 * 60 * 60 * 1000)
    }, timeout)
  }
}

export const notificationService = new NotificationService()
