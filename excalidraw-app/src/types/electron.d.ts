export interface ElectronAPI {
  openFile: () => Promise<{ filePath: string; content: string } | null>;
  saveContent: (
    content: string,
    defaultFileName?: string,
  ) => Promise<string | null>;
  exportFile: (content: string, extension: string) => Promise<string | null>;
}

declare global {
  interface Window {
    electronAPI?: ElectronAPI;
  }
}

export {};
