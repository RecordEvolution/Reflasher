import { waitForMount } from './drives'
import { ChildProcessWithoutNullStreams } from 'child_process'
import { FlashItem } from '../../types'
import { elevatedChildProcess, getSudoPassword } from './permissions'
import { copyFile, rename, unlink, writeFile } from 'fs/promises'
import ImageManager from './boards'
import path from 'path'
import { tmpdir } from 'os'

const activeFlashProcesses = new Map<number, ChildProcessWithoutNullStreams>()
export const imageManager = new ImageManager()
imageManager.createReflasherDirIfNotExists()

const copyConfigFile = async (driveDescription: string, reswarmConfigPath: string) => {
  const mountedDrive = await waitForMount(driveDescription)

  console.log('Device mounted, copying configuration ...')

  if (mountedDrive.mountpoints.length === 0) {
    throw new Error('Mountpoint not found!')
  }

  const targetPath = mountedDrive.mountpoints[0].path

  console.log(
    `Copy ${reswarmConfigPath} ===> ${path.join(targetPath, path.basename(reswarmConfigPath))}`
  )

  try {
    await copyFile(reswarmConfigPath, path.join(targetPath, path.basename(reswarmConfigPath)))
    console.log('Copied configuration')
  } catch (e) {
    console.log('The file could not be copied')
    throw e
  }
}

export const flashDevice = async (flashItem: FlashItem, onStdout: (data: string) => void) => {
  if (!flashItem.drive || !flashItem.fullPath) throw new Error('drive not set')

  let imagePath = flashItem.fullPath
  if (flashItem.reswarm) {
    // Update .reswarm file (for WiFi information, etc.)
    await writeFile(flashItem.fullPath, JSON.stringify(flashItem.reswarm.config))

    const image = flashItem.reswarm?.config?.board.latestImages[0]

    if (!image) throw new Error('latest image is empty')

    if (image.osvariant !== 'image') {
      throw new Error(`Os variant ${image.osvariant} not yet supported.`)
    }

    const imageFileExists = await imageManager.checkIfImageFileExists(image)
    if (imageFileExists) {
      imagePath = imageManager.getImagePath(image)
    } else {
      const zippedImageTempPath = path.join(imageManager.reflasherConfigPath, 'temp-' + image.file)
      const realImageTempPath = path.join(
        imageManager.reflasherConfigPath,
        'temp-' + image.file.slice(0, -3)
      )

      const realImagePath = path.join(imageManager.reflasherConfigPath, image.file.slice(0, -3))

      try {
        await imageManager.downloadImageToFile(image, zippedImageTempPath, (progress) => {
          onStdout(JSON.stringify({ ...progress, type: 'downloading' }))
        })

        await imageManager.unZipImage(image, zippedImageTempPath, (progress) => {
          onStdout(JSON.stringify({ ...progress, type: 'decompressing' }))
        })

        await rename(realImageTempPath, realImagePath)

        imagePath = imageManager.getImagePath(image)
      } catch (error) {
        unlink(zippedImageTempPath)
      }
    }
  }

  const scriptContent = `
    const { sourceDestination, multiWrite } = require('etcher-sdk')
    process.on('SIGTERM', () => {
      process.stdout.write('{"canceled":true}')
      process.exit(0)
    });

    async function flash() {
      const _imageFile = new sourceDestination.File({
        path: "${imagePath}"
      })
    
      const drive = JSON.parse('${JSON.stringify(flashItem.drive)}')
      const _blockDevice = new sourceDestination.BlockDevice({
        drive,
        write: true,
        unmountOnSuccess: false
      })

      const source = await _imageFile.getInnerSource()

      let progressData
      await multiWrite.decompressThenFlash({
        source,
        destinations: [_blockDevice],
        onFail: (_, error) => {
          process.stderr.write(error.toString())
          process.exit(1)
        },
        onProgress: (progress) => {
          progressData = progress
          process.stdout.write(JSON.stringify(progress))
        },
        verify: true
      })
      
      progressData.type = "${flashItem.reswarm ? 'configuring' : 'finished'}"
      process.stdout.write(JSON.stringify(progressData))
    }

    flash()
  `

  const childProcess = await elevatedChildProcess(
    scriptContent,
    getSudoPassword(),
    onStdout,
    undefined,
    async (code, signal) => {
      activeFlashProcesses.delete(flashItem.id)
      if (code === 0 && signal === null && flashItem.reswarm) {
        await copyConfigFile(flashItem.drive?.description!, flashItem.fullPath)
        onStdout(
          JSON.stringify({
            averageSpeed: 0,
            eta: 0,
            percentage: 0,
            speed: 0,
            bytesWritten: 0,
            type: 'finished'
          })
        )
      }
    }
  )

  activeFlashProcesses.set(flashItem.id, childProcess)
}

export const cancelFlashing = async (id: number) => {
  const flashProcess = activeFlashProcesses.get(id)
  if (flashProcess && flashProcess.pid) {
    flashProcess.kill('SIGTERM')
  }
}

// export class FlashManager {
//   private _imageFile: sourceDestination.File
//   private _blockDevice: sourceDestination.BlockDevice

//   constructor(imagePath: string, targetDrive: Drive) {
//     // preparing source image
//     this._imageFile = new sourceDestination.File({
//       path: imagePath
//     })

//     // preparing target
//     this._blockDevice = new sourceDestination.BlockDevice({
//       drive: targetDrive,
//       write: true,
//       unmountOnSuccess: false
//     })
//   }

//   async flash({
//     onFailure,
//     flashProgress,
//     verifyProgress,
//     onProgress
//   }: {
//     onFailure?: (e: Error) => void
//     flashProgress?: (p: number) => void
//     verifyProgress?: (p: number) => void
//     onProgress?: (progress: multiWrite.MultiDestinationProgress) => void
//   }) {
//     const source = await this._imageFile.getInnerSource()

//     // flashing proccess (multiWrite.pipeSourceToDestinations would also work. )
//     await multiWrite.decompressThenFlash({
//       source,
//       destinations: [this._blockDevice],
//       onFail: (_, error) => {
//         if (onFailure) {
//           onFailure(error)
//         }
//       },
//       onProgress: (progress) => {
//         if (onProgress) {
//           onProgress(progress)
//         }

//         if (progress.type === 'flashing') {
//           if (progress.percentage) {
//             if (flashProgress) {
//               flashProgress(progress.percentage)
//             }
//           }
//         }
//         if (progress.type === 'verifying') {
//           if (progress.percentage) {
//             if (verifyProgress) {
//               verifyProgress(progress.percentage)
//             }
//           }
//         }
//       },
//       verify: true
//     })
//   }

//   async copyConfigFile(driveDescription: string, reswarmConfigPath: string) {
//     const mountedDrive = await waitForMount(driveDescription)

//     console.log('Device mounted, copying configuration ...')

//     if (mountedDrive.mountpoints.length === 0) {
//       throw new Error('Mountpoint not found!')
//     }

//     const targetPath = mountedDrive.mountpoints[0].path

//     console.log(
//       `Copy ${reswarmConfigPath} ===> ${path.join(targetPath, path.basename(reswarmConfigPath))}`
//     )

//     try {
//       await copyFile(reswarmConfigPath, path.join(targetPath, path.basename(reswarmConfigPath)))
//       console.log('Copied configuration')
//     } catch (e) {
//       console.log('The file could not be copied')
//       throw e
//     }
//   }
// }
