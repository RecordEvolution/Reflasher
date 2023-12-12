import { homedir, tmpdir } from 'node:os'
import { createGunzip } from 'node:zlib'
import { access, mkdir, readFile, rename } from 'node:fs/promises'
import { createWriteStream, createReadStream } from 'node:fs'
import https from 'node:https'
import path from 'node:path'
import { ImageInfo, SupportedBoard } from '../../types'

const CONFIG_PATH = '.Reflasher'
const AVAILABLE_IMAGES = 'supportedBoardsImages.json'
const BUCKET_URL = 'https://storage.googleapis.com/reswarmos/'

export default class ImageManager {
  get reflasherConfigPath() {
    return path.join(homedir(), CONFIG_PATH)
  }

  getImagePath(image: ImageInfo) {
    return path.join(this.reflasherConfigPath, image.file.slice(0, -3))
  }

  async createReflasherDirIfNotExists() {
    try {
      await access(this.reflasherConfigPath)
    } catch {
      console.log(`Creating config folder at ${this.reflasherConfigPath}`)
      try {
        await mkdir(this.reflasherConfigPath)
      } catch (error) {
        console.log('Could not create config folder')
        throw error
      }
    }
  }

  async readSupportedBoards(): Promise<SupportedBoard[]> {
    const fileContent = await readFile(path.join(this.reflasherConfigPath, AVAILABLE_IMAGES))
    const parsed = JSON.parse(fileContent.toString())
    return parsed.boards
  }

  downloadSupportedBoards(): Promise<SupportedBoard[]> {
    let file = ''
    return new Promise((resolve, reject) => {
      https
        .get(BUCKET_URL + AVAILABLE_IMAGES, (req) => {
          req.on('data', (d) => {
            file = file + d.toString()
          })
          req.on('error', (err) => reject(err))
        })
        .on('error', (err) => {
          reject(err)
        })
        .on('close', () => {
          resolve(JSON.parse(file).boards)
        })
    })
  }

  async checkIfImageZipExists(image: ImageInfo): Promise<boolean> {
    try {
      await access(path.join(this.reflasherConfigPath, image.file))
      return true
    } catch {
      return false
    }
  }

  async checkIfImageFileExists(image: ImageInfo): Promise<boolean> {
    try {
      await access(path.join(this.reflasherConfigPath, image.file.slice(0, -3)))
      return true
    } catch {
      return false
    }
  }

  calculateSpeed = (
    written: number,
    elapsedTime: number
  ): { speed: number; averageSpeed: number } => {
    const speed = written / elapsedTime // Bytes per second
    const averageSpeed = written / (elapsedTime / 1000) // Bytes per second (convert elapsedTime to seconds)
    return { speed, averageSpeed }
  }

  calculateETA = (written: number, speed: number, totalSize: number): number => {
    const remainingBytes = totalSize - written
    return remainingBytes / speed // Seconds
  }

  async downloadImageToFile(
    image: ImageInfo,
    tempPath: string,
    progress?: (payload: {
      percentage: number
      averageSpeed: number
      speed: number
      eta: number
      bytesWritten: number
    }) => void
  ) {
    const writeStream = createWriteStream(tempPath)

    let written = 0
    let startTime: number | null = null

    if (progress) {
      progress({ averageSpeed: 0, eta: 0, percentage: 0, speed: 0, bytesWritten: 0 })
    }

    await new Promise((resolve, reject) => {
      https
        .get(image.download, (res) => {
          startTime = Date.now()

          res.on('data', (buf) => {
            writeStream.write(buf, (err) => {
              if (err) {
                reject(err)
              }
              if (progress) {
                written += buf.length
                const elapsedTime = (Date.now() - startTime!) / 1000 // Convert to seconds
                const { speed, averageSpeed } = this.calculateSpeed(written, elapsedTime)
                const eta = this.calculateETA(written, speed, image.size)
                const percentage = (written / image.size) * 100
                progress({ percentage, averageSpeed, eta, speed, bytesWritten: written })
              }
            })
          })

          res.on('end', () => {
            writeStream.end(() => {
              writeStream.close()
            })
          })
        })
        .on('error', (err) => {
          reject(err)
        })
        .on('close', () => {
          resolve(undefined)
        })
    })
  }

  unZipImage(
    image: ImageInfo,
    tempPath: string,
    progress?: (progress: {
      percentage: number
      averageSpeed: number
      speed: number
      eta: number
      bytesWritten: number
    }) => void
  ): Promise<void> {
    const sourcePath = tempPath
    const fileExtension = path.extname(sourcePath)

    if (fileExtension !== '.gz') {
      throw new Error(`Unzip error: file extension '${fileExtension}' is not supported!`)
    }

    const targetPath = sourcePath.slice(0, -3)

    const readStream = createReadStream(sourcePath)
    const writeStream = createWriteStream(targetPath)
    const zipTransform = createGunzip()

    zipTransform.pipe(writeStream)

    let written = 0
    let startTime: number | null = null

    if (progress) {
      progress({ averageSpeed: 0, eta: 0, percentage: 0, speed: 0, bytesWritten: 0 })
    }

    return new Promise((resolve, reject) => {
      readStream.on('data', (buf) => {
        startTime = Date.now()

        zipTransform.write(buf, (err) => {
          if (err) {
            reject(err)
          }
          if (progress) {
            written += buf.length
            const elapsedTime = (Date.now() - startTime!) / 1000 // Convert to seconds
            const { speed, averageSpeed } = this.calculateSpeed(written, elapsedTime)
            const eta = this.calculateETA(written, speed, image.size)
            const percentage = (written / image.size) * 100
            progress({ percentage, averageSpeed, eta, speed, bytesWritten: written })
          }
        })
      })

      readStream.on('end', () => {
        zipTransform.end()
      })

      zipTransform.on('end', () => {
        resolve()
      })
    })
  }
}
