import { defineStore } from 'pinia'
import { SupportedBoard } from 'src/types'

type BoardStoreState = {
  items: SupportedBoard[]
  initialized: boolean
}

export const useBoardStore = () => {
  const store = defineStore('board', {
    state: (): BoardStoreState => ({ items: [], initialized: false }),
    getters: { boards: (state) => state.items },
    actions: {
      initialize: async function () {
        const boards = await window.api.getSupportedBoards()
        this.items = boards
      }
    }
  })

  const BoardStore = store()
  if (!BoardStore.initialized) {
    BoardStore.initialize()
  }

  return BoardStore
}
