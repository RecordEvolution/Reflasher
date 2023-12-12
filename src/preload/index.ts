import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'
import { FlashItem, RPC, SupportedBoard } from '../types'
import { Drive } from 'drivelist'
import type { OpenMode } from 'fs'
import type { Abortable } from 'events'
import { WiFiNetwork } from 'node-wifi'

// Custom APIs for renderer
const api = {
  listDrives: () => ipcRenderer.invoke(RPC.ListDrives) as Promise<Drive[]>,
  unmount: (path: string) => ipcRenderer.invoke(RPC.Unmount, path) as Promise<void>,
  mount: (drive: Drive) => ipcRenderer.invoke(RPC.Mount, drive) as Promise<void>,
  chooseFile: () => ipcRenderer.invoke(RPC.ChooseFile) as Promise<Electron.OpenDialogReturnValue>,
  readFile: (
    path: string,
    options?:
      | ({
          encoding: BufferEncoding
          flag?: OpenMode | undefined
        } & Abortable)
      | BufferEncoding
  ) => ipcRenderer.invoke(RPC.ReadFile, path, options),
  getSupportedBoards: () => ipcRenderer.invoke(RPC.GetSupportedBoards) as Promise<SupportedBoard[]>,
  scanWifi: () => ipcRenderer.invoke(RPC.ScanWifi) as Promise<WiFiNetwork[]>,
  flashDevice: (flashItem: FlashItem) => ipcRenderer.invoke(RPC.FlashDevice, flashItem),
  cancelFlashing: (id: number) => ipcRenderer.invoke(RPC.CancelFlashing, id),
  setSudoPassword: (password: string) => ipcRenderer.invoke(RPC.SetSudoPassword, password),
  isSudoPasswordSet: () => ipcRenderer.invoke(RPC.IsSudoPasswordSet) as Promise<boolean>
}

export type Api = typeof api

// Use `contextBridge` APIs to expose Electron APIs to
// renderer only if context isolation is enabled, otherwise
// just add to the DOM global.
if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI)
    contextBridge.exposeInMainWorld('api', api)
    contextBridge.exposeInMainWorld('ipcRenderer', {
      send: (channel, data) => {
        ipcRenderer.send(channel, data)
      },
      receive: (channel, func) => {
        ipcRenderer.on(channel, (event, ...args) => func(...args))
      }
    })
  } catch (error) {
    console.error(error)
  }
} else {
  // @ts-ignore (define in dts)
  window.electron = electronAPI
  // @ts-ignore (define in dts)
  window.api = api
  // @ts-ignore
  window.ipcRenderer = ipcRenderer
}
