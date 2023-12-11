import { list as listdrives } from 'drivelist'
import { elevatedChildProcess, getSudoPassword } from './permissions'

export async function listDrives() {
  const drives = await listdrives()
  return drives.filter(
    (d) => !d.mountpoints.find((m) => m.path.includes('boot')) && d.busType !== 'UNKNOWN'
  )
}

const wait = (ms: number): Promise<void> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve()
    }, ms)
  })
}

export const waitForMount = async (description: string) => {
  while (true) {
    console.log('Checking mounted drives ...')
    const drives = await listdrives()
    const drive = drives.filter((d) => d.isRemovable && d.description === description)
    console.log(drive)
    if (drive.length === 1) {
      if (drive[0].mountpoints.length !== 0) {
        return drive[0]
      }
    }
    await wait(1000)
  }
}

export async function unmountDisk(drivePath: string) {
  // Create a separate script to run the unmount operation
  const scriptContent = `
    const mountutils = require('mountutils');

    mountutils.unmountDisk("${drivePath}", (err) => {
      if (err) {
        process.stderr.write(err.message);
        process.exit(1);
      }

      process.exit(0);
    });
  `

  const sudoPassword = getSudoPassword()
  return elevatedChildProcess(scriptContent, sudoPassword)
}
