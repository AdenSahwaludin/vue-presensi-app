export class CameraService {
  private stream: MediaStream | null = null

  async checkCameraSupport(): Promise<boolean> {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      console.error('Camera API not supported')
      return false
    }

    // Check if running on HTTPS or localhost
    const isSecureContext = window.isSecureContext || 
                           location.protocol === 'https:' || 
                           location.hostname === 'localhost' || 
                           location.hostname === '127.0.0.1'
    
    if (!isSecureContext) {
      console.error('Camera requires HTTPS or localhost')
      return false
    }

    return true
  }

  async requestPermission(): Promise<boolean> {
    try {
      const result = await navigator.permissions.query({ name: 'camera' as PermissionName })
      
      if (result.state === 'granted') {
        return true
      } else if (result.state === 'prompt') {
        // Try to get permission by requesting camera
        const stream = await navigator.mediaDevices.getUserMedia({ video: true })
        stream.getTracks().forEach(track => track.stop())
        return true
      } else {
        console.error('Camera permission denied')
        return false
      }
    } catch (error) {
      console.error('Error checking camera permission:', error)
      return false
    }
  }

  async startCamera(): Promise<MediaStream> {
    try {
      // Check support first
      const isSupported = await this.checkCameraSupport()
      if (!isSupported) {
        throw new Error('Camera not supported on this device/browser')
      }

      // Enhanced camera constraints for better compatibility
      const constraints: MediaStreamConstraints = {
        video: {
          width: { ideal: 1280, max: 1920 },
          height: { ideal: 720, max: 1080 },
          facingMode: 'user',
          frameRate: { ideal: 30, max: 60 }
        },
        audio: false
      }

      this.stream = await navigator.mediaDevices.getUserMedia(constraints)
      console.log('Camera started successfully')
      return this.stream
    } catch (error: any) {
      console.error('Camera start error:', error)
      
      // Provide specific error messages
      if (error.name === 'NotAllowedError') {
        throw new Error('Camera access denied. Please allow camera permission in your browser.')
      } else if (error.name === 'NotFoundError') {
        throw new Error('No camera found on this device.')
      } else if (error.name === 'NotSupportedError') {
        throw new Error('Camera not supported on this device.')
      } else if (error.name === 'SecurityError') {
        throw new Error('Camera access requires HTTPS connection.')
      } else {
        throw new Error(`Camera error: ${error.message || 'Unknown error'}`)
      }
    }
  }

  stopCamera(): void {
    if (this.stream) {
      this.stream.getTracks().forEach((track) => track.stop())
      this.stream = null
    }
  }

  capturePhoto(video: HTMLVideoElement): string {
    const canvas = document.createElement('canvas')
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight

    const ctx = canvas.getContext('2d')
    if (!ctx) throw new Error('Canvas context not available')

    ctx.drawImage(video, 0, 0)
    return canvas.toDataURL('image/jpeg', 0.8)
  }

  async takePhoto(): Promise<string> {
    const video = document.createElement('video')
    const stream = await this.startCamera()

    return new Promise((resolve, reject) => {
      video.srcObject = stream
      video.play()

      video.onloadedmetadata = () => {
        try {
          const photo = this.capturePhoto(video)
          this.stopCamera()
          resolve(photo)
        } catch (error) {
          this.stopCamera()
          reject(error)
        }
      }
    })
  }
}

export const cameraService = new CameraService()
