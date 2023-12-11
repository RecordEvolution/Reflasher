import wifi from 'node-wifi'

export function scanNetworks() {
  wifi.init({ iface: null })
  return wifi.scan()
}
