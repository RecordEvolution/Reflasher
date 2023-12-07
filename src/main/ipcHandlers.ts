import { ipcMain } from 'electron'
import { RPC } from '../preload'

function handleListDrives() {}

export function setupIpcHandlers() {
  ipcMain.handle(RPC.ListDrives, handleListDrives)
}
