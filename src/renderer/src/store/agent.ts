import { defineStore } from 'pinia'
import { FlashItem } from 'src/types'
import Convert from 'ansi-to-html'
import { deepToRaw } from '@renderer/utils'

type AgentStoreState = {
  items: string[]
  agentState: string
  initialized: boolean
}
const ansi_converter = new Convert({ stream: true, bg: '#fff', fg: '#000' })

export const useAgentStore = () => {
  const store = defineStore('agent', {
    state: (): AgentStoreState => ({ items: [], initialized: false, agentState: '' }),
    getters: {
      logs: (state) => state.items,
      active: (state) => state.agentState === 'active',
      state: (state) => state.agentState
    },
    actions: {
      async testDevice(flashItem: FlashItem) {
        return window.api.testDevice(deepToRaw(flashItem))
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

        window.ipcRenderer.receive('agent-state', ({ state }) => {
          this.agentState = state
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
