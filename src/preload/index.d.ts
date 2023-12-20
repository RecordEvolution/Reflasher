import { ElectronAPI } from '@electron-toolkit/preload'
import { Api } from './index'
import { IpcRenderer } from 'electron'
import SudoDialogVue from '@renderer/components/SudoDialog.vue'

declare global {
  interface Window {
    electron: ElectronAPI
    api: Api
    sudoDialog: typeof SudoDialogVue
    ipcRenderer: {
      send: (channel: string, data?: any) => void
      receive: (channel: string, cb: Function) => void
    }
  }
}
