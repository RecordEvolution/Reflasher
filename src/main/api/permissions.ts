import { spawn, exec } from 'child_process'
import fs from 'fs/promises'
import path from 'path'
import { v4 as uuidv4 } from 'uuid'

let sudoPassword: string
let sudoPasswordSet: boolean

export const setSudoPassword = (password: string) => {
  if (!checkSudoPassword(password)) throw new Error('invalidPassword')

  sudoPasswordSet = true
  sudoPassword = password
}

export const isSudoPasswordSet = async (): Promise<boolean> => {
  if (!sudoPassword) return false
  return await checkSudoPassword(sudoPassword)
}

const checkSudoPassword = (password: string): Promise<boolean> => {
  return new Promise((res) => {
    exec(`echo ${password} | sudo -S ls`, (error) => {
      if (error) {
        res(false)
      } else {
        res(true)
      }
    })
  })
}

export const getSudoPassword = () => {
  if (!sudoPasswordSet) throw new Error('sudo password not set')
  return sudoPassword
}

export const elevatedChildProcess = (
  code: string,
  password: string,
  onStdout?: (data: string) => void,
  onStderr?: (data: string) => void,
  onExit?: (code: number | null, signal: NodeJS.Signals | null) => void
) => {
  const platform = process.platform
  if (platform === 'darwin' || platform === 'linux') {
    return elevatedChildProcessUnix(code, password, onStdout, onStderr, onExit)
  }

  return Promise.resolve() as any
}

const elevatedChildProcessUnix = async (
  code: string,
  password: string,
  onStdout?: (data: string) => void,
  onStderr?: (data: string) => void,
  onExit?: (code: number | null, signal: NodeJS.Signals | null) => void
) => {
  const uniqueID = uuidv4()
  const fileName = uniqueID + '.js'
  const scriptPath = path.join(__dirname, fileName)

  await fs.writeFile(scriptPath, code)

  const command = 'sudo'
  const args = ['-S', 'node', scriptPath]

  const childProcess = spawn(command, args)

  childProcess.stdin.write(password)
  childProcess.stdin.end()

  if (onStdout) {
    childProcess.stdout.on('data', (data) => onStdout(data.toString()))
  }

  if (onStderr) {
    childProcess.stderr.on('data', (data) => onStderr(data.toString()))
  }

  childProcess.on('error', (d) => console.log(d))

  childProcess.on('exit', (code, signal) => {
    fs.unlink(scriptPath)
    if (onExit) {
      onExit(code, signal)
    }
  })

  return childProcess
}
