import { ElectronAPI } from '@electron-toolkit/preload'

declare global {
  interface Window {
    electron: ElectronAPI
    api: {
      sendMessage: (message: string) => void
      resetChat: () => void
      handleAiResponse: (
        callback: (event: Electron.IpcRendererEvent, response: string) => void
      ) => void
      removeHandleAiResponse: (
        callback: (event: Electron.IpcRendererEvent, response: string) => void
      ) => void
    }
  }
}
