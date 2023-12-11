import { WiFiNetwork } from 'node-wifi'
import { defineStore } from 'pinia'

type WifiStoreState = {
  items: WiFiNetwork[]
  initialized: boolean
}

export const useWifiStore = () => {
  const store = defineStore('wifi', {
    state: (): WifiStoreState => ({ items: [], initialized: false }),
    getters: { accessPoints: (state) => state.items },
    actions: {
      initialize: async function () {
        const accessPoints = await window.api.scanWifi()
        this.items = accessPoints.filter((s) => s.ssid)
      }
    }
  })

  const WifiStore = store()
  if (!WifiStore.initialized) {
    WifiStore.initialize()
  }

  return WifiStore
}
