import { app, shell, BrowserWindow, ipcMain } from 'electron'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import { setupIpcHandlers } from './ipcHandlers'
import installExtension from 'electron-devtools-installer'
import icon from '../../resources/icon.png?asset'
import { join } from 'path'
import { activeProcesses, cleanupAppImageIfExists } from './api/permissions'
import { isFile, killProcessDarwin } from './utils'
import log from 'electron-log/main'
import fixPath from 'fix-path'

fixPath()

log.initialize({ preload: true })

function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 960,
    height: 600,
    frame: true,
    resizable: false,
    maximizable: false,
    title: 'Reflasher',
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

  // Prevent external resources from being loaded (like images)
  // when dropping them on the WebView.
  // See https://github.com/electron/electron/issues/5919
  // mainWindow.webContents.on('will-navigate', (event) => {
  //   event.preventDefault()
  // })

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

const imageItemListReady = new Promise((res) => ipcMain.on('image-item-store-ready', res))

async function handleArguments(argv: string[]) {
  if (process.platform === 'linux' || process.platform === 'win32') {
    const parameters = argv.slice(app.isPackaged ? 1 : 2)

    if (!parameters.length) return

    const param = parameters[parameters.length - 1]
    if (param.startsWith('--')) {
      return
    }

    if (!(await isFile(param))) return

    await imageItemListReady

    BrowserWindow.getAllWindows().forEach((window) =>
      window.webContents.send('add-image-item', { filePath: param })
    )
  }
}

app.on('before-quit', () => {
  app.releaseSingleInstanceLock()
})

app.setAsDefaultProtocolClient('reswarm')
app.on('open-file', async (event, path) => {
  event.preventDefault()

  if (!(await isFile(path))) return

  await imageItemListReady

  BrowserWindow.getAllWindows().forEach((window) =>
    window.webContents.send('add-image-item', { filePath: path })
  )
})

app.on('window-all-closed', async () => {
  activeProcesses.forEach((p) => {
    try {
      if (process.platform === 'darwin' && p.pid) {
        killProcessDarwin(9, p.pid) // SIGKILL
      } else {
        p.kill('SIGKILL')
      }
    } catch (error) {
      // nullop
    }
  })

  await cleanupAppImageIfExists().catch(console.error)

  if (process.platform !== 'darwin') {
    app.quit()
  }
})

async function main() {
  if (!app.requestSingleInstanceLock()) return app.quit()

  await app.whenReady()

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

    await handleArguments(argv)
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

  await handleArguments(process.argv)
}

main()
