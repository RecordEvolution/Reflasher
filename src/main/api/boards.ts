import { homedir } from 'node:os'
import { createGunzip } from 'node:zlib'
import { access, mkdir, readFile } from 'node:fs/promises'
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

  downloadImageToFile(image: ImageInfo, progress?: (p: number) => void): Promise<void> {
    const writeStream = createWriteStream(path.join(this.reflasherConfigPath, image.file))

    let written = 0
    let lastPercentage = 0

    if (progress) {
      progress(0)
    }

    return new Promise((resolve, reject) => {
      https
        .get(image.download, (res) => {
          res.on('data', (buf) => {
            writeStream.write(buf, (err) => {
              if (err) {
                reject(err)
              }
              if (progress) {
                written += buf.length
                const prog = Math.floor((written / image.size) * 100)
                if (prog > lastPercentage) {
                  progress(prog)
                  lastPercentage = prog
                }
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
          resolve()
        })
    })
  }

  unZipImage(image: ImageInfo, progress?: (p: number) => void): Promise<void> {
    const sourcePath = path.join(this.reflasherConfigPath, image.file)
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
    let lastPercentage = 0

    if (progress) {
      progress(0)
    }

    return new Promise((resolve, reject) => {
      readStream.on('data', (buf) => {
        zipTransform.write(buf, (err) => {
          if (err) {
            reject(err)
          }
          if (progress) {
            written += buf.length
            const prog = Math.floor((written / image.size) * 100)
            if (prog > lastPercentage) {
              progress(prog)
              lastPercentage = prog
            }
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

// todo: offline mode, using cached images only
// todo: remove older images from cache

// const runImagesWizard = async () => {
//   const imageManager = new ImageManager()

//   await imageManager.createReflasherDirIfNotExists()

//   const boards = await imageManager.downloadSupportedBoards()

//   const choices = boards.map((b) => ({
//     name: `${b.modelname} (${b.architecture})`,
//     value: b
//   }))

//   const answerBoard = await select({
//     message: 'Which board do you want to flash?',
//     choices
//   })

//   const image = answerBoard.latestImages[0]

//   // todo: support iso
//   if (image.osvariant !== 'image') {
//     throw new Error(`Os variant ${image.osvariant} not yet supported.`)
//   }

//   const imageFileExists = await imageManager.checkIfImageFileExists(image)

//   if (imageFileExists) {
//     console.log(`Using cached Image: ${imageManager.getImagePath(image)} ...`)
//     return imageManager.getImagePath(image)
//   }

//   const zipFileExists = await imageManager.checkIfImageZipExists(image)

//   if (!zipFileExists) {
//     console.log('Downloading Image ...')

//     const flashProgressBar = new SingleBar({
//       format: 'Download Progress |{bar}| {percentage}%'
//     })

//     flashProgressBar.start(100, 0)
//     await imageManager.downloadImageToFile(image, (p) => flashProgressBar.update(p))
//     flashProgressBar.stop()
//   }

//   console.log('Extracting Image ...')

//   const extractProgressBar = new SingleBar({
//     format: 'Extract  Progress |{bar}| {percentage}%'
//   })

//   extractProgressBar.start(100, 0)
//   await imageManager.unZipImage(image, (p) => extractProgressBar.update(p))
//   extractProgressBar.stop()

//   return imageManager.getImagePath(image)
// }
