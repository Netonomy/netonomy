import { app, shell, BrowserWindow, ipcMain } from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import icon from '../../resources/icon.png?asset'

let LlamaModel, LlamaContext, LlamaChatSession, session, context, model, LlamaChatPromptWrapper

async function sendMessage(event: any, message: string) {
  await session.prompt(message, {
    onToken(chunk) {
      event.reply('ai-response', context.decode(chunk))
    },
    temperature: 0
  })

  event.reply('ai-response', 'END')
}

async function loadModel() {
  import('node-llama-cpp')
    .then(async (module) => {
      LlamaModel = module.LlamaModel
      LlamaContext = module.LlamaContext
      LlamaChatSession = module.LlamaChatSession
      LlamaChatPromptWrapper = module.LlamaChatPromptWrapper

      class MyCustomChatPromptWrapper extends module.ChatPromptWrapper {
        public readonly wrapperName: string = 'MyCustomChat'

        public override wrapPrompt(
          prompt: string,
          { systemPrompt, promptIndex }: { systemPrompt: string; promptIndex: number }
        ) {
          if (promptIndex === 0) {
            return (
              '<|im_start|>system\n' +
              systemPrompt +
              '<|im_end|>\n<|im_start|>user\n' +
              prompt +
              '<|im_end|>\n<|im_start|>assistant\n'
            )
          } else {
            return '<|im_start|>user\n' + prompt + '<|im_end|>\n<|im_start|>assistant\n'
          }
        }

        public override getStopStrings(): string[] {
          return ['<|im_end|>']
        }

        public override getDefaultStopString(): string {
          return '<|im_end|>'
        }
      }

      model = new LlamaModel({
        modelPath:
          '/Users/anthonydemattos/netonomy/models/mistral/openhermes-2.5-mistral-7b-16k.Q4_K_M.gguf'
      })
      context = new LlamaContext({ model })
      session = new LlamaChatSession({
        context,
        promptWrapper: new MyCustomChatPromptWrapper(),
        systemPrompt:
          'You are a AI Assistant running locally on a users computer, and your purpose and drive is to assist the user with any request they have.'
      })
    })
    .catch((err) => {
      console.error('Failed to load module node-llama-cpp', err)
    })
}

async function resetChat() {
  loadModel()
}

function createWindow(): void {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    show: false,
    autoHideMenuBar: true,
    titleBarStyle: 'hidden',
    minWidth: 335,
    ...(process.platform === 'linux' ? { icon } : {}),
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false
    }
  })

  mainWindow.maximize()

  loadModel()

  mainWindow.on('ready-to-show', () => {
    mainWindow.show()
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  // HMR for renderer base on electron-vite cli.
  // Load the remote URL for development or the local html file for production.
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  // Set app user model id for windows
  electronApp.setAppUserModelId('com.electron')

  // Default open or close DevTools by F12 in development
  // and ignore CommandOrControl + R in production.
  // see https://github.com/alex8088/electron-toolkit/tree/master/packages/utils
  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  ipcMain.on('send-message', sendMessage)
  ipcMain.on('reset-chat', resetChat)

  createWindow()

  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

// In this file you can include the rest of your app"s specific main process
// code. You can also put them in separate files and require them here.
