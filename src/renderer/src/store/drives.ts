import { deepToRaw } from '@renderer/utils'
import { Drive } from 'drivelist'
import { defineStore } from 'pinia'

type DrivesStoreState = {
  items: Drive[]
  initialized: boolean
}

export const useDrivesStore = () => {
  const store = defineStore('drives', {
    state: (): DrivesStoreState => ({ items: [], initialized: false }),
    getters: {
      drives: (state) => state.items
    },
    actions: {
      async initialize() {
        await this.fetchDrives()

        window.ipcRenderer.receive('drive-scanner-attach', () => {
          this.fetchDrives()
        })
        window.ipcRenderer.receive('drive-scanner-progress', console.log)
        window.ipcRenderer.receive('drive-scanner-detach', () => {
          this.fetchDrives()
        })

        window.ipcRenderer.receive('drive-scanner-error', (_, error) => {
          console.error('A drive scanner error occurred:', error)
        })

        this.initialized = true
      },
      async fetchDrives() {
        this.items = await window.api.listDrives()
      },
      async mountDrive(drive: Drive) {
        return window.api.mount(deepToRaw(drive))
      },
      async unmountDrive(drive: Drive) {
        await window.sudoDialog.openDialog()
        return window.api.unmount(drive.device)
      }
    }
  })

  const driveStore = store()
  if (!driveStore.initialized) {
    driveStore.initialize()
  }

  return driveStore
}
