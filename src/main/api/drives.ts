import { Drive, list as listdrives } from 'drivelist'
import { elevatedChildProcess, elevatedExecUnix, execAsync, getSudoPassword } from './permissions'

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

function parseUnixPartitionOutput(output: string) {
  const splitOutput = output.split('\n')
  const indexOfHeader = splitOutput.findIndex((l) => {
    const potentialHeaderSplit = l.split(/\s/g).filter((e) => e)
    const device = potentialHeaderSplit[0] === 'Device'

    return device
  })

  const partitionInfoStringArr = splitOutput.slice(indexOfHeader + 1).filter((e) => e)

  const partitions: {
    device: string
    boot: boolean
    start: string
    end: string
    sectors: string
    size: string
    id: string
    type: string
  }[] = []
  for (const partLine of partitionInfoStringArr) {
    const splitPartLine = partLine.split(/\s+/).filter((e) => e)

    const boot = splitPartLine[1] === '*'
    const offset = boot ? 1 : 0

    partitions.push({
      device: splitPartLine[0],
      boot,
      start: splitPartLine[offset + 1],
      end: splitPartLine[offset + 2],
      sectors: splitPartLine[offset + 3],
      size: splitPartLine[offset + 4],
      id: splitPartLine[offset + 5],
      type: splitPartLine.slice(offset + 6).join(' ')
    })
  }

  return partitions
}

const parseDarwinPartitionOutput = (output: string) => {
  const splitOutput = output.split('\n')
  splitOutput.splice(0, 3) // remove title, header and disk partition

  const partitions: { typeName: string; size: string; identifier: string }[] = []
  for (const line of splitOutput) {
    const [_, typeName, size, sizeUnit, identifier] = line.split(/\s/).filter(Boolean)

    if (identifier !== '-') {
      partitions.push({ typeName, size: `${size} ${sizeUnit}`, identifier })
    }
  }

  return partitions
}

export const automountDrive = (drive: Drive) => {
  switch (process.platform) {
    case 'darwin': {
      return automountDriveDarwin(drive)
    }
    case 'linux': {
      return automountDriveLinux(drive)
    }
    case 'win32': {
      return
    }
  }
}

export const automountDriveDarwin = async (drive: Drive) => {
  const output = await execAsync(`diskutil list ${drive.device}`)
  const partitions = parseDarwinPartitionOutput(output)

  for (const partition of partitions) {
    await execAsync(`diskutil mount /dev/${partition.typeName}`)
  }
}

export const automountDriveLinux = async (drive: Drive) => {
  const sudoPassword = getSudoPassword()
  const fdiskOutput = await elevatedExecUnix(`fdisk -l ${drive.device}`, sudoPassword)
  const partitions = parseUnixPartitionOutput(fdiskOutput)

  await execAsync('udevadm settle')

  for (const partition of partitions) {
    await execAsync(`udisksctl mount -b ${partition.device}`)
  }
}

export const waitForMount = async (description: string) => {
  while (true) {
    const drives = await listdrives()
    const drive = drives.filter((d) => d.isRemovable && d.description === description)
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
