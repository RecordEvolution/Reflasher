import { spawn, exec, SpawnOptionsWithoutStdio } from 'child_process'
import fs from 'fs/promises'
import path from 'path'
import { v4 as uuidv4 } from 'uuid'

let sudoPassword: string
let sudoPasswordSet: boolean

export const setSudoPassword = async (password: string) => {
  const isValidSudoPassword = await checkSudoPassword(password)
  if (!isValidSudoPassword) throw new Error('invalidPassword')

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

export const elevatedNodeChildProcess = (
  code: string,
  onStdout?: (data: string) => void,
  onStderr?: (data: string) => void,
  onExit?: (code: number | null, signal: NodeJS.Signals | null) => void,
  options?: SpawnOptionsWithoutStdio
) => {
  const platform = process.platform
  if (platform === 'darwin' || platform === 'linux') {
    return elevatedNodeChildProcessUnix(code, onStdout, onStderr, onExit, options)
  }

  return elevatedNodeChildProcessWindows(code, onStdout, onStderr, onExit, options)
}

export const execAsync = async (command: string): Promise<{ stdout: string; stderr: string }> => {
  return new Promise((res, rej) => {
    exec(command, (error, stdout, stderr) => {
      if (error) {
        rej(error)
        return
      }

      // Parse and process the stdout here
      res({ stdout, stderr })
    })
  })
}

export const elevatedExec = async (command: string) => {
  if (process.platform === 'darwin' || process.platform === 'linux') {
    return elevatedExecUnix(command)
  }

  return execAsync(command)
}

export const elevatedExecUnix = async (
  command: string
): Promise<{ stdout: string; stderr: string; code: number | null; signal: string | null }> => {
  return new Promise((res, rej) => {
    const stdoutData: string[] = []
    const stderrData: string[] = []
    let error: Error

    const args = ['-E', '-S', ...command.split(' ')]
    const childProcess = spawn('sudo', args)

    childProcess.stdin.write(getSudoPassword())
    childProcess.stdin.end()

    childProcess.stdout.on('data', (data) => stdoutData.push(data.toString()))

    childProcess.stderr.on('data', (data) => stderrData.push(data.toString()))

    childProcess.on('error', (err) => {
      error = err
    })

    childProcess.on('exit', (code, signal) => {
      if (code != null && code < 0) {
        return rej({ error, code, signal })
      }

      res({ stdout: stdoutData.join(''), stderr: stderrData.join(''), code, signal })
    })
  })
}

const elevatedNodeChildProcessUnix = async (
  code: string,
  onStdout?: (data: string) => void,
  onStderr?: (data: string) => void,
  onExit?: (code: number | null, signal: NodeJS.Signals | null) => void,
  options?: SpawnOptionsWithoutStdio
) => {
  const uniqueID = uuidv4()
  const fileName = uniqueID + '.js'
  const scriptPath = path.join(process.resourcesPath, fileName)

  await fs.writeFile(scriptPath, code)

  const command = 'sudo'
  const args = ['-E', '-S', process.execPath, scriptPath]
  const childProcess = spawn(command, args, { env: { ELECTRON_RUN_AS_NODE: '1' }, ...options })

  childProcess.stdin.write(getSudoPassword())
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

export const elevatedChildProcess = async (
  command: string,
  args: string[],
  onStdout?: (data: string) => void,
  onStderr?: (data: string) => void,
  onExit?: (code: number | null, signal: NodeJS.Signals | null) => void,
  options?: SpawnOptionsWithoutStdio
) => {
  return childProcess('sudo', ['-E', '-S', command, ...args], onStdout, onStderr, onExit, options)
}

export const childProcess = (
  command: string,
  args: string[],
  onStdout?: (data: string) => void,
  onStderr?: (data: string) => void,
  onExit?: (code: number | null, signal: NodeJS.Signals | null) => void,
  options?: SpawnOptionsWithoutStdio
) => {
  const childProcess = spawn(command, args, options)

  if (onStdout) {
    childProcess.stdout.on('data', (data) => onStdout(data.toString()))
  }

  if (onStderr) {
    childProcess.stderr.on('data', (data) => onStderr(data.toString()))
  }

  childProcess.on('error', (d) => console.log(d))

  childProcess.on('exit', (code, signal) => {
    if (onExit) {
      onExit(code, signal)
    }
  })

  return childProcess
}

const elevatedNodeChildProcessWindows = async (
  code: string,
  onStdout?: (data: string) => void,
  onStderr?: (data: string) => void,
  onExit?: (code: number | null, signal: NodeJS.Signals | null) => void,
  options?: SpawnOptionsWithoutStdio
) => {
  const uniqueID = uuidv4()
  const fileName = uniqueID + '.js'
  const scriptPath = path.join(process.resourcesPath, fileName)

  await fs.writeFile(scriptPath, code)

  const command = process.execPath
  const args = [scriptPath]

  const childProcess = spawn(command, args, { env: { ELECTRON_RUN_AS_NODE: '1' }, ...options })

  if (onStdout) {
    childProcess.stdout.on('data', (data) => onStdout(data.toString()))
  }

  if (onStderr) {
    childProcess.stderr.on('data', (data) => onStderr(data.toString()))
  }

  childProcess.on('error', (d) => console.log(d))

  childProcess.on('exit', (code, signal) => {
    // fs.unlink(scriptPath)
    if (onExit) {
      onExit(code, signal)
    }
  })

  return childProcess
}
