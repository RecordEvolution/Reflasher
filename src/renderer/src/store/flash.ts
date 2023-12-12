import { defineStore } from 'pinia'
import { FlashItem, ReswarmConfig, SupportedBoard } from 'src/types'
import { useDrivesStore } from './drives'
import { useBoardStore } from './boards'
import { toRaw } from 'vue'
import { deepToRaw } from '@renderer/utils'
import { WriteStep } from 'etcher-sdk/build/multi-write'

type FlashStoreState = {
  items: FlashItem[]
  key: number
  initialized: boolean
}

type FlashProgress = {
  canceled: boolean
  position: number
  bytes: number
  speed: number
  averageSpeed: number
  active: number
  failed: number
  type: WriteStep | 'idle'
  sparse: boolean
  size: number
  bytesWritten: number
  percentage: number
  eta: number
}

export const useFlashStore = () => {
  const store = defineStore('flash', {
    state: (): FlashStoreState => ({ items: [], initialized: false, key: 0 }),
    getters: {
      flashItems: (state) => state.items,
      flashItemById: (state) => {
        return (id: number) => state.items.find((item) => item.id === id)
      }
    },
    actions: {
      async addItem() {
        const driveStore = useDrivesStore()
        const boardStore = useBoardStore()
        const { canceled, filePaths } = await window.api.chooseFile()

        if (canceled) return

        const [fullPath] = filePaths

        const splitPath = fullPath.split('/')
        const fileName = splitPath.at(-1) as string
        const fileDirectory = splitPath.slice(0, -1).join('/')

        const fileType = fileName?.split('.').at(-1) as string
        const defaultDrive = driveStore.drives[0] ?? undefined

        const flashItem: FlashItem = {
          id: this.key++,
          fileDirectory,
          fileType,
          fullPath,
          fileName,
          flash: {
            progress: 0,
            state: 'idle',
            speed: 0,
            avgSpeed: 0,
            eta: 0
          },
          drive: defaultDrive
        }

        if (fileType === 'reswarm') {
          const configFileString = (await window.api.readFile(fullPath, {
            encoding: 'utf8'
          })) as string

          const config = JSON.parse(configFileString) as ReswarmConfig
          const board = boardStore.boards.find((b) => b.model === config.board.model) as SupportedBoard
          config.board = board

          flashItem.reswarm = {
            config
          }
        }

        this.items.push(flashItem)
      },
      async flashDevice(flashItem: FlashItem) {
        await window.sudoDialog.openDialog()

        return window.api.flashDevice(deepToRaw(flashItem))
      },
      cancelFlashing(flashItem: FlashItem) {
        return window.api.cancelFlashing(flashItem.id)
      },
      reset(flashItem: FlashItem) {
        const item = this.items.find((i) => i.id === flashItem.id)
        if (item) {
          item.flash = {
            progress: 0,
            state: 'idle',
            speed: 0,
            avgSpeed: 0,
            eta: 0
          }
        }
      },
      removeItem(flashItem: FlashItem) {
        const flashItemIndex = this.items.findIndex((fi) => fi.id === flashItem.id)
        this.items.splice(flashItemIndex, 1)
      },
      initialize() {
        window.ipcRenderer.receive(
          'flash-progress',
          ({ progress, id }: { progress: FlashProgress; id: number }) => {
            const item = this.items.find((i) => i.id === id)
            if (item) {
              if (progress.canceled) {
                item.flash = {
                  progress: 0,
                  state: 'idle',
                  speed: 0,
                  avgSpeed: 0,
                  eta: 0
                }

                return
              }

              item.flash.state = progress.type
              item.flash.progress = progress.percentage
              item.flash.speed = progress.speed
              item.flash.eta = progress.eta
              item.flash.avgSpeed = progress.averageSpeed
            }
          }
        )
      }
    }
  })

  const FlashStore = store()
  if (!FlashStore.initialized) {
    FlashStore.initialize()
  }

  return FlashStore
}
