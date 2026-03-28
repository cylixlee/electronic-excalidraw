export const isElectron = () => {
  return typeof window !== "undefined" && !!window.electronAPI;
};

export const openFile = async (): Promise<{
  filePath: string;
  content: string;
} | null> => {
  if (!isElectron()) return null;
  return window.electronAPI!.openFile();
};

export const saveContent = async (
  content: string,
  defaultFileName?: string,
): Promise<string | null> => {
  if (!isElectron()) return null;
  return window.electronAPI!.saveContent(content, defaultFileName);
};

export const exportFile = async (
  content: string,
  extension: string,
): Promise<string | null> => {
  if (!isElectron()) return null;
  return window.electronAPI!.exportFile(content, extension);
};
