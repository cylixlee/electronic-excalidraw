import path from "path";
import fs from "fs";

import { app, BrowserWindow, dialog, ipcMain, Menu } from "electron";

const isDev = !app.isPackaged;

let mainWindow: BrowserWindow | null = null;
let currentFilePath: string | null = null;

const APP_NAME = "Electronic Excalidraw";

const getLaunchFilePath = (): string | null => {
  const fileArg = process.argv.find((arg) => arg.endsWith(".excalidraw"));
  return fileArg && fs.existsSync(fileArg) ? fileArg : null;
};

const updateWindowTitle = () => {
  if (!mainWindow) {
    return;
  }
  const baseTitle = currentFilePath
    ? `${path.basename(currentFilePath)} - ${APP_NAME}`
    : APP_NAME;
  mainWindow.setTitle(baseTitle);
};

function createWindow(): void {
  currentFilePath = getLaunchFilePath();

  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 800,
    minHeight: 600,
    title: currentFilePath
      ? `${path.basename(currentFilePath)} - ${APP_NAME}`
      : APP_NAME,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false,
    },
    show: false,
  });

  mainWindow.once("ready-to-show", () => {
    mainWindow?.show();
  });

  if (isDev) {
    mainWindow.loadURL("http://localhost:3000");
    mainWindow.webContents.openDevTools();
  } else {
    const indexPath = path.join(__dirname, "..", "..", "build", "index.html");
    mainWindow.loadFile(indexPath);
  }

  mainWindow.on("closed", () => {
    mainWindow = null;
  });
}

function setupIPC(): void {
  ipcMain.handle(
    "save-content",
    async (_event, content: string, defaultFileName?: string) => {
      const result = await dialog.showSaveDialog(mainWindow!, {
        defaultPath: defaultFileName || "drawing.excalidraw",
        filters: [
          { name: "Excalidraw", extensions: ["excalidraw"] },
          { name: "JSON", extensions: ["json"] },
        ],
      });

      if (!result.canceled && result.filePath) {
        fs.writeFileSync(result.filePath, content, "utf-8");
        return result.filePath;
      }
      return null;
    },
  );

  ipcMain.handle(
    "export-file",
    async (_event, content: string, extension: string) => {
      const result = await dialog.showSaveDialog(mainWindow!, {
        filters: [{ name: extension.toUpperCase(), extensions: [extension] }],
      });

      if (!result.canceled && result.filePath) {
        fs.writeFileSync(result.filePath, content);
        return result.filePath;
      }
      return null;
    },
  );

  ipcMain.handle("open-file", async () => {
    const result = await dialog.showOpenDialog(mainWindow!, {
      filters: [
        { name: "Excalidraw", extensions: ["excalidraw"] },
        { name: "All Files", extensions: ["*"] },
      ],
      properties: ["openFile"],
    });

    if (!result.canceled && result.filePaths.length > 0) {
      const filePath = result.filePaths[0];
      const content = fs.readFileSync(filePath, "utf-8");
      return { filePath, content };
    }
    return null;
  });

  ipcMain.handle("get-launch-file", async () => {
    const filePath = getLaunchFilePath();
    if (filePath) {
      try {
        const content = fs.readFileSync(filePath, "utf-8");
        JSON.parse(content);
        return { filePath, content };
      } catch {
        return null;
      }
    }
    return null;
  });

  ipcMain.handle("set-title", async (_event, title: string) => {
    if (mainWindow) {
      mainWindow.setTitle(title);
    }
  });

  ipcMain.handle(
    "set-current-file",
    async (_event, filePath: string | null) => {
      currentFilePath = filePath;
      updateWindowTitle();
    },
  );
}

app.whenReady().then(() => {
  Menu.setApplicationMenu(null);
  setupIPC();
  createWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});
