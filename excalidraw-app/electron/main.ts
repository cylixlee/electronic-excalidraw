import { app, BrowserWindow, dialog, ipcMain, Menu } from "electron";
import path from "path";
import fs from "fs";
import { autoUpdater } from "electron-updater";
import log from "electron-log";

log.initialize();
log.info("Application starting...");

const isDev = !app.isPackaged;

let mainWindow: BrowserWindow | null = null;

function createWindow(): void {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 800,
    minHeight: 600,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false,
    },
    show: false,
  });

  mainWindow.once("ready-to-show", () => {
    mainWindow?.show();
    log.info("Main window shown");
  });

  if (isDev) {
    mainWindow.loadURL("http://localhost:3000");
    mainWindow.webContents.openDevTools();
  } else {
    const indexPath = path.join(__dirname, "..", "..", "build", "index.html");
    log.info("Loading index.html from:", indexPath);
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
      try {
        const result = await dialog.showSaveDialog(mainWindow!, {
          defaultPath: defaultFileName || "drawing.excalidraw",
          filters: [
            { name: "Excalidraw", extensions: ["excalidraw"] },
            { name: "JSON", extensions: ["json"] },
          ],
        });

        if (!result.canceled && result.filePath) {
          fs.writeFileSync(result.filePath, content, "utf-8");
          log.info("File saved:", result.filePath);
          return result.filePath;
        }
        return null;
      } catch (error) {
        log.error("Save content error:", error);
        throw error;
      }
    },
  );

  ipcMain.handle(
    "export-file",
    async (_event, content: string, extension: string) => {
      try {
        const result = await dialog.showSaveDialog(mainWindow!, {
          filters: [{ name: extension.toUpperCase(), extensions: [extension] }],
        });

        if (!result.canceled && result.filePath) {
          fs.writeFileSync(result.filePath, content);
          log.info("File exported:", result.filePath);
          return result.filePath;
        }
        return null;
      } catch (error) {
        log.error("Export file error:", error);
        throw error;
      }
    },
  );

  ipcMain.handle("open-file", async () => {
    try {
      const result = await dialog.showOpenDialog(mainWindow!, {
        filters: [
          { name: "Excalidraw", extensions: ["excalidraw", "json"] },
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
    } catch (error) {
      log.error("Open file error:", error);
      throw error;
    }
  });
}

app.whenReady().then(() => {
  log.info("App ready");

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

app.on("before-quit", () => {
  log.info("Application quitting");
});

if (!isDev) {
  const updateFilePath = path.join(__dirname, "..", "..", "app-update.yml");
  if (fs.existsSync(updateFilePath)) {
    autoUpdater.checkForUpdatesAndNotify().catch((err) => {
      log.error("Auto-updater error:", err);
    });
  } else {
    log.info("No app-update.yml found, skipping auto-updater");
  }
}
