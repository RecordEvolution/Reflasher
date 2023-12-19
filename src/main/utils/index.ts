import { createWriteStream, promises } from 'fs'
import fs from 'fs/promises'
import https from 'https'
import { Progress } from '../../types'

export const calculateSpeed = (
  written: number,
  elapsedTime: number
): { speed: number; averageSpeed: number } => {
  const speed = written / elapsedTime // Bytes per second
  const averageSpeed = written / (elapsedTime / 1000) // Bytes per second (convert elapsedTime to seconds)
  return { speed, averageSpeed }
}

export const calculateETA = (written: number, speed: number, totalSize: number): number => {
  const remainingBytes = totalSize - written
  return remainingBytes / speed // Seconds
}

export const getRemoteFileSize = (url: string): Promise<number> => {
  return new Promise((res, rej) => {
    const request = https.request(url, { method: 'HEAD' }, (result) => {
      result.on('error', rej)
      result.on('data', console.log)
      result.on('end', () => {
        if (result.statusCode !== 200) return rej(new Error('failed to get file'))
        res(parseInt(result?.headers?.['content-length'] ?? '0'))
      })
    })

    request.end()
  })
}

export const fileExists = async (filePath: string) => {
  try {
    await fs.access(filePath)
    return true
  } catch (err) {
    return false
  }
}

export const downloadFile = async (
  url: string,
  path: string,
  progress?: (progress: Partial<Progress>) => void,
  options?: {
    flags?: string | undefined
    encoding?: BufferEncoding | undefined
    fd?: number | promises.FileHandle | undefined
    mode?: number | undefined
    autoClose?: boolean | undefined
    emitClose?: boolean | undefined
    start?: number | undefined
    highWaterMark?: number | undefined
  }
): Promise<void> => {
  const writeStream = createWriteStream(path, options)

  let written = 0
  let startTime: number | null = null

  if (progress) {
    progress({ averageSpeed: 0, eta: 0, percentage: 0, speed: 0, bytesWritten: 0 })
  }

  const size = await getRemoteFileSize(url)

  return new Promise((resolve, reject) => {
    https
      .get(url, (res) => {
        startTime = Date.now()

        res.on('data', (buf) => {
          writeStream.write(buf, (err) => {
            if (err) {
              reject(err)
            }
            if (progress) {
              written += buf.length
              const elapsedTime = (Date.now() - startTime!) / 1000 // Convert to seconds
              const { speed, averageSpeed } = calculateSpeed(written, elapsedTime)
              const eta = calculateETA(written, speed, size)
              const percentage = (written / size) * 100
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
      .on('error', reject)
      .on('close', () => {
        resolve(undefined)
      })
  })
}
