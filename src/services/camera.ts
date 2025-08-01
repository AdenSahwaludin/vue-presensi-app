export class CameraService {
  private stream: MediaStream | null = null

  async startCamera(): Promise<MediaStream> {
    try {
      this.stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: 'user',
        },
      })
      return this.stream
    } catch (error) {
      throw new Error('Camera access denied or not available')
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
