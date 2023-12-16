const { exec } = require('child_process')

if (process.platform === 'win32') {
  exec('npm i winusb-driver-generator', console.log)
}
