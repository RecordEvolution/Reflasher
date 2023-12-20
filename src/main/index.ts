import { app, shell, BrowserWindow } from 'electron'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import { setupIpcHandlers } from './ipcHandlers'
import installExtension from 'electron-devtools-installer'
import icon from '../../resources/icon.png?asset'
import { join } from 'path'
import { activeProcesses, cleanupAppImageIfExists } from './api/permissions'

function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 960,
    height: 600,
    frame: true,
    resizable: false,
    maximizable: false,
    show: false,
    autoHideMenuBar: true,
    ...(process.platform === 'linux' ? { icon } : {}),
    webPreferences: {
      nodeIntegration: true,
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false
    }
  })

  mainWindow.on('ready-to-show', () => {
    mainWindow.show()
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  setupIpcHandlers(mainWindow)

  // HMR for renderer base on electron-vite cli.
  // Load the remote URL for development or the local html file for production.
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }

  return mainWindow
}

app.on('window-all-closed', async () => {
  activeProcesses.forEach((process) => {
    try {
      process.kill('SIGKILL')
    } catch (error) {}
  })

  await cleanupAppImageIfExists().catch(console.error)

  if (process.platform !== 'darwin') {
    app.quit()
  }
})

async function main() {
  if (!app.requestSingleInstanceLock()) return app.quit()

  await app.whenReady()

  if (process.platform === 'linux' || process.platform === 'win32') {
    if (app.isPackaged) {
      // workaround for missing executable argument)
      process.argv.unshift()
    }
    // parameters is now an array containing any files/folders that your OS will pass to your application
    const parameters = process.argv.slice(2)

    console.log(parameters)
  }

  // Set app user model id for windows
  electronApp.setAppUserModelId('com.recordevolution')

  if (is.dev) {
    await installExtension('nhdogjmejiglipccpnnnanhbledajbpd', {
      loadExtensionOptions: {
        allowFileAccess: true
      }
    })
  }

  const window = createWindow()
  app.on('second-instance', async (_event, argv) => {
    if (window.isMinimized()) {
      window.restore()
    }
    window.focus()

    console.log('opening second instance with:', { argv })
  })

  // Default open or close DevTools by F12 in development
  // and ignore CommandOrControl + R in production.
  // see https://github.com/alex8088/electron-toolkit/tree/master/packages/utils
  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
}

main()
