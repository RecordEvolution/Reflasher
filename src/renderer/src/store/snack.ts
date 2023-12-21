import { defineStore } from 'pinia'

type SnackStoreState = {
  initialized: boolean
  _text: string
  _visible: boolean
  _color: string
}

export const useSnackStore = () => {
  const store = defineStore('snack', {
    state: (): SnackStoreState => ({
      initialized: false,
      _visible: false,
      _text: '',
      _color: 'primary'
    }),
    getters: {
      text: (state) => state._text,
      color: (state) => state._color,
      visible: (state) => state._visible
    },
    actions: {
      async initialize() {
        this.initialized = true
      },
      setColor(color: string) {
        this._color = color
      },
      setVisible(visible: boolean) {
        this._visible = visible
      },
      setText(text: string) {
        this._text = text
      }
    }
  })

  const Snacktore = store()
  if (!Snacktore.initialized) {
    Snacktore.initialize()
  }

  return Snacktore
}
