import { BrowserWindow, OpenDialogOptions, dialog, ipcMain } from 'electron'
import { platform } from 'os'
import { FlashItem, RPC } from '../types'
import { listDrives, unmountDisk } from '../main/api/drives'
import { scanner } from 'etcher-sdk'
import { readFile } from 'fs/promises'
import { OpenMode } from 'fs'
import { Abortable } from 'events'
import { scanNetworks } from './api/wifi'
import { cancelFlashing, flashDevice, imageManager } from './api/flash'
import { isSudoPasswordSet, setSudoPassword } from './api/permissions'

function handleListDrives() {
  return listDrives()
}

function handleUnmount(_, drivePath: string) {
  return unmountDisk(drivePath)
}

function handleDriveScanner(mainWindow: BrowserWindow) {
  const adapters: scanner.adapters.Adapter[] = [
    new scanner.adapters.BlockDeviceAdapter({
      includeSystemDrives: () => true
    }),
    new scanner.adapters.UsbbootDeviceAdapter()
  ]
  if (platform() === 'win32') {
    if (scanner.adapters.DriverlessDeviceAdapter !== undefined) {
      adapters.push(new scanner.adapters.DriverlessDeviceAdapter())
    }
  }
  const deviceScanner = new scanner.Scanner(adapters)
  deviceScanner.on('attach', async (drive: scanner.adapters.AdapterSourceDestination) => {
    mainWindow.webContents.send('drive-scanner-attach', drive)
    if (drive.emitsProgress) {
      drive.on('progress', (progress: number) => {
        mainWindow.webContents.send('drive-scanner-progress', { drive, progress })
      })
    }
  })
  deviceScanner.on('detach', (drive: scanner.adapters.AdapterSourceDestination) => {
    mainWindow.webContents.send('drive-scanner-detach', drive)
  })
  deviceScanner.on('error', (error: Error) => {
    mainWindow.webContents.send('drive-scanner-error', error)
  })
  deviceScanner.start()
}

function handleChooseFile(mainWindow: BrowserWindow) {
  const options: OpenDialogOptions = {
    title: 'Select file',
    defaultPath: process.env.HOME + '/Downloads',
    filters: [{ name: '.reswarm, .img, .iso', extensions: ['reswarm', 'img', 'iso'] }],
    properties: ['openFile', 'multiSelections']
  }

  return dialog.showOpenDialog(mainWindow, options)
}

function handleReadFile(
  _,
  path: string,
  options?:
    | ({
        encoding: BufferEncoding
        flag?: OpenMode | undefined
      } & Abortable)
    | BufferEncoding
) {
  return readFile(path, options)
}

function handleSupportedBoards() {
  return imageManager.downloadSupportedBoards()
}

function handleWifiScan() {
  return scanNetworks()
}

function handleFlashDevice(_, mainWindow: BrowserWindow, flashItem: FlashItem) {
  return flashDevice(flashItem, (data) => {
    mainWindow.webContents.send('flash-progress', { progress: JSON.parse(data), id: flashItem.id })
  })
}

function handleSetSudoPassword(password: string) {
  return setSudoPassword(password)
}

function handleIsSudoPasswordSet() {
  return isSudoPasswordSet()
}

function handleCancelFlashing(id: number) {
  return cancelFlashing(id)
}

export function setupIpcHandlers(mainWindow: BrowserWindow) {
  ipcMain.handle(RPC.ListDrives, handleListDrives)
  ipcMain.handle(RPC.Unmount, handleUnmount)
  ipcMain.handle(RPC.ChooseFile, () => handleChooseFile(mainWindow))
  ipcMain.handle(RPC.ReadFile, handleReadFile)
  ipcMain.handle(RPC.GetSupportedBoards, handleSupportedBoards)
  ipcMain.handle(RPC.ScanWifi, handleWifiScan)
  ipcMain.handle(RPC.FlashDevice, (_, flashItem) => handleFlashDevice(_, mainWindow, flashItem))
  ipcMain.handle(RPC.SetSudoPassword, (_, password) => handleSetSudoPassword(password))
  ipcMain.handle(RPC.IsSudoPasswordSet, handleIsSudoPasswordSet)
  ipcMain.handle(RPC.CancelFlashing, (_, id) => handleCancelFlashing(id))

  handleDriveScanner(mainWindow)
}
