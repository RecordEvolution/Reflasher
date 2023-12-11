import { FlashItem } from '../../types'
import { elevatedChildProcess, getSudoPassword } from './permissions'

export const flashDevice = (flashItem: FlashItem, onStdout: (data: string) => void) => {
  if (!flashItem.drive || !flashItem.fullPath) throw new Error('drive not set')

  const scriptContent = `
    const { sourceDestination, multiWrite } = require('etcher-sdk')
    async function flash() {
      const _imageFile = new sourceDestination.File({
        path: "${flashItem.fullPath}"
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
      
      progressData.type = "finished"
      process.stdout.write(JSON.stringify(progressData))
    }
    flash()
  `

  return elevatedChildProcess(scriptContent, getSudoPassword(), onStdout)
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
