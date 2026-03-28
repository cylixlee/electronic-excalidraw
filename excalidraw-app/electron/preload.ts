import { contextBridge, ipcRenderer } from "electron";

export interface ElectronAPI {
  openFile: () => Promise<{ filePath: string; content: string } | null>;
  saveContent: (
    content: string,
    defaultFileName?: string,
  ) => Promise<string | null>;
  exportFile: (content: string, extension: string) => Promise<string | null>;
}

const electronAPI: ElectronAPI = {
  openFile: () => ipcRenderer.invoke("open-file"),
  saveContent: (content, defaultFileName) =>
    ipcRenderer.invoke("save-content", content, defaultFileName),
  exportFile: (content, extension) =>
    ipcRenderer.invoke("export-file", content, extension),
};

contextBridge.exposeInMainWorld("electronAPI", electronAPI);
