import { contextBridge, ipcRenderer } from "electron";

export interface ElectronAPI {
  openFile: () => Promise<{ filePath: string; content: string } | null>;
  saveContent: (
    content: string,
    defaultFileName?: string,
  ) => Promise<string | null>;
  exportFile: (content: string, extension: string) => Promise<string | null>;
  getLaunchFile: () => Promise<{ filePath: string; content: string } | null>;
  setTitle: (title: string) => Promise<void>;
  setCurrentFile: (filePath: string | null) => Promise<void>;
}

const electronAPI: ElectronAPI = {
  openFile: () => ipcRenderer.invoke("open-file"),
  saveContent: (content, defaultFileName) =>
    ipcRenderer.invoke("save-content", content, defaultFileName),
  exportFile: (content, extension) =>
    ipcRenderer.invoke("export-file", content, extension),
  getLaunchFile: () => ipcRenderer.invoke("get-launch-file"),
  setTitle: (title) => ipcRenderer.invoke("set-title", title),
  setCurrentFile: (filePath) =>
    ipcRenderer.invoke("set-current-file", filePath),
};

contextBridge.exposeInMainWorld("electronAPI", electronAPI);
