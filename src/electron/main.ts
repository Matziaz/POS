import { app, BrowserWindow } from "electron";
import path from "node:path";
import { registerAllIpcHandlers, disconnectPrisma } from "./ipcHandlers";

function createWindow() {
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      contextIsolation: true,
      preload: path.join(__dirname, "preload.js"),
    },
  });

  // DEV: carga Vite
  if (process.env.VITE_DEV_SERVER_URL) {
    win.loadURL(process.env.VITE_DEV_SERVER_URL);
    win.webContents.openDevTools({ mode: "detach" });
    return;
  }

  // PROD: carga el build de Vite
  const indexHtml = path.join(__dirname, "../renderer/index.html");
  win.loadFile(indexHtml);
}

app.whenReady().then(() => {
  registerAllIpcHandlers();
  createWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on("window-all-closed", async () => {
  await disconnectPrisma();
  if (process.platform !== "darwin") app.quit();
});