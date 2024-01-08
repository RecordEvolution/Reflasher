import { defineStore } from 'pinia'

type UpdateStoreState = {
  _hasUpdate: boolean
  _showDialog: boolean
  _busy: boolean
  _state: 'install' | 'download' | 'announce'
  _progress: number
  initialized: boolean
}

export const useUpdateStore = () => {
  const store = defineStore('update', {
    state: (): UpdateStoreState => ({
      _hasUpdate: false,
      _showDialog: false,
      _busy: false,
      _state: 'announce',
      initialized: false,
      _progress: 0
    }),
    getters: {
      showDialog: (state) => state._showDialog,
      hasUpdate: (state) => state._hasUpdate,
      updateState: (state) => state._state,
      updateProgress: (state) => state._progress,
      busy: (state) => state._busy
    },
    actions: {
      setShowDialog: function (showDialog: boolean) {
        this._showDialog = showDialog
      },
      downloadUpdate: function () {
        this._busy = true
        return window.api.downloadUpdate()
      },
      installUpdate: function () {
        return window.api.installUpdate()
      },
      initialize: async function () {
        window.ipcRenderer.receive('update-status', ({ state, progress }) => {
          switch (state) {
            case 'update-available':
              if (this._state === 'install') break

              this._state = 'announce'
              this.setShowDialog(true)
              break
            case 'update-progress':
              this._progress = progress.percent
              this._state = 'download'
              this.setShowDialog(true)
              break
            case 'update-downloaded':
              if (this._busy) {
                this._busy = false
              }

              this._state = 'install'
              this.setShowDialog(true)
              break
          }
        })
      }
    }
  })

  const UpdateStore = store()
  if (!UpdateStore.initialized) {
    UpdateStore.initialize()
  }

  return UpdateStore
}
