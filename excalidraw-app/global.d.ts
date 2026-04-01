/// <reference types="@excalidraw/excalidraw/global" />

interface Window {
  __EXCALIDRAW_SHA__: string | undefined;
  electronAPI?: {
    openFile: () => Promise<{ filePath: string; content: string } | null>;
    saveContent: (
      content: string,
      defaultFileName?: string,
    ) => Promise<string | null>;
    exportFile: (content: string, extension: string) => Promise<string | null>;
    getLaunchFile: () => Promise<{ filePath: string; content: string } | null>;
    setTitle: (title: string) => Promise<void>;
    setCurrentFile: (filePath: string | null) => Promise<void>;
  };
}
