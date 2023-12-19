import { defineStore } from 'pinia'
import { FlashItem } from 'src/types'
import Convert from 'ansi-to-html'
import { deepToRaw } from '@renderer/utils'

type AgentStoreState = {
  items: string[]
  flashItem: FlashItem | null
  agentState: string
  dockerInitialized: boolean
  _dockerInfoDialog: boolean
  initialized: boolean
}
const ansi_converter = new Convert({ stream: true, bg: '#fff', fg: '#000' })

export const useAgentStore = () => {
  const store = defineStore('agent', {
    state: (): AgentStoreState => ({
      items: [],
      initialized: false,
      dockerInitialized: false,
      _dockerInfoDialog: false,
      agentState: '',
      flashItem: null
    }),
    getters: {
      logs: (state) => state.items,
      hasDocker: (state) => state.dockerInitialized,
      dockerInfoDialog: (state) => state._dockerInfoDialog,
      activeItem: (state) => state.flashItem,
      active: (state) => state.agentState === 'active',
      state: (state) => state.agentState
    },
    actions: {
      async setDockerInfoDialog(value: boolean) {
        this._dockerInfoDialog = value
      },
      async testDevice(flashItem: FlashItem) {
        const hasDocker = await window.api.hasDocker()
        this.dockerInitialized = hasDocker
        this._dockerInfoDialog = !hasDocker

        if (hasDocker) {
          window.api.testDevice(deepToRaw(flashItem))
        }
      },
      async stopDevice() {
        return window.api.stopDevice()
      },
      async initialize() {
        window.ipcRenderer.receive('agent-logs', ({ logs }) => {
          this.items = []
          logs.forEach((log: string) => {
            this.items.push(ansi_converter.toHtml(log))
            this.items.push('<br/>')
          })
        })

        window.ipcRenderer.receive('agent-state', ({ state, activeItem }) => {
          this.agentState = state
          this.flashItem = activeItem
        })

        this.initialized = true
      }
    }
  })

  const agentStore = store()
  if (!agentStore.initialized) {
    agentStore.initialize()
  }

  return agentStore
}
