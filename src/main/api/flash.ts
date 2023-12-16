import { automountDriveLinux, waitForMount } from './drives'
import { ChildProcessWithoutNullStreams } from 'child_process'
import { FlashItem } from '../../types'
import { elevatedChildProcess } from './permissions'
import { copyFile, rename, unlink, writeFile } from 'fs/promises'
import ImageManager from './boards'
import path from 'path'
import { Drive } from 'drivelist'
import { is } from '@electron-toolkit/utils'

const activeFlashProcesses = new Map<number, ChildProcessWithoutNullStreams>()
export const imageManager = new ImageManager()
imageManager.createReflasherDirIfNotExists()

const copyConfigFile = async (drive: Drive, reswarmConfigPath: string) => {
  // For some reason linux doesn't automount the drive, so we have to manually do it
  if (process.platform === 'linux') {
    await automountDriveLinux(drive)
  }

  const mountedDrive = await waitForMount(drive.description)

  if (mountedDrive.mountpoints.length === 0) {
    throw new Error('Mountpoint not found!')
  }

  const targetPath = mountedDrive.mountpoints[0].path

  return copyFile(reswarmConfigPath, path.join(targetPath, path.basename(reswarmConfigPath)))
}

export const flashDevice = async (flashItem: FlashItem, updateState: (data: string) => void) => {
  if (!flashItem.drive || !flashItem.fullPath) throw new Error('drive not set')

  let imagePath = flashItem.fullPath
  const image = flashItem.reswarm?.config?.board.latestImages[0]

  if (flashItem.reswarm) {
    // Update .reswarm file (for WiFi information, etc.)
    await writeFile(flashItem.fullPath, JSON.stringify(flashItem.reswarm.config))

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
          updateState(JSON.stringify({ ...progress, type: 'downloading' }))
        })

        await imageManager.unZipImage(image, zippedImageTempPath, (progress) => {
          updateState(JSON.stringify({ ...progress, type: 'decompressing' }))
        })

        await rename(realImageTempPath, realImagePath)

        imagePath = imageManager.getImagePath(image)
      } catch (error) {
        unlink(zippedImageTempPath)
      }
    }
  }

  let stringifiedDrive = JSON.stringify(flashItem.drive)
  if (process.platform === 'win32') {
    imagePath = imagePath.replace(/\\/g, '\\\\')
    stringifiedDrive = stringifiedDrive.replace(/\\/g, '\\\\')
  }

  const etcherSDKRequire = is.dev ? 'etcher-sdk' : './app.asar/node_modules/etcher-sdk'
  const scriptContent = `
    const { sourceDestination, multiWrite } = require('${etcherSDKRequire}')
    process.on('SIGTERM', () => {
      process.stdout.write('{"canceled":true}')
      process.exit(0)
    });

    async function flash() {
      const _imageFile = new sourceDestination.File({
        path: "${imagePath}"
      })
    
      const drive = JSON.parse('${stringifiedDrive}')
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
          console.log(error)
          process.exit(1)
        },
        onProgress: (progress) => {
          progressData = progress
          process.stdout.write(JSON.stringify(progress))
        },
        verify: true
      })
      
      progressData.type = "${flashItem.reswarm ? 'configuring' : 'finished'}"
      const finalPayload = JSON.stringify(progressData)
      process.stdout.write(finalPayload)
    }

    flash()
  `

  async function handleOnExit(code: number | null, signal: NodeJS.Signals | null) {
    activeFlashProcesses.delete(flashItem.id)

    // Copy the file over when the flashing process has exited without an error code
    if (code === 0 && signal === null && flashItem.reswarm && image?.osvariant === 'image') {
      try {
        await copyConfigFile(flashItem.drive!, flashItem.fullPath)
      } catch (error) {
        if (process.platform !== 'win32') throw error

        // For some reason, the first time this fails on windows, doing it again works.
        await copyConfigFile(flashItem.drive!, flashItem.fullPath)
      }

      updateState(
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

  updateState(JSON.stringify({ type: 'starting' }))

  const childProcess = await elevatedChildProcess(
    scriptContent,
    updateState,
    console.error,
    handleOnExit
  )
  activeFlashProcesses.set(flashItem.id, childProcess)
}

export const cancelFlashing = async (id: number) => {
  const flashProcess = activeFlashProcesses.get(id)
  if (flashProcess && flashProcess.pid) {
    flashProcess.kill('SIGTERM')
  }
}
