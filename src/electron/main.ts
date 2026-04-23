import { app, BrowserWindow } from "electron";
import path from "node:path";
import { registerAllIpcHandlers, disconnectPrisma, hasOpenCashRegister } from "./ipcHandlers";
import { buildPreCloseAlertPayload, shouldEmitPreCloseAlert } from "./preCloseScheduler";

const PRE_CLOSE_TICK_MS = 60_000;
let preCloseTimer: NodeJS.Timeout | null = null;
let lastPreCloseAlertBusinessDate: string | null = null;

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

async function runPreCloseSchedulerTick() {
  const now = new Date();
  const hasOpenRegister = await hasOpenCashRegister();
  const decision = shouldEmitPreCloseAlert({
    now,
    hasOpenRegister,
    lastAlertBusinessDate: lastPreCloseAlertBusinessDate,
  });

  if (!decision.emit) return;

  lastPreCloseAlertBusinessDate = decision.businessDate;
  const payload = buildPreCloseAlertPayload(now, decision.businessDate);

  for (const window of BrowserWindow.getAllWindows()) {
    if (window.isDestroyed()) continue;
    window.webContents.send("cashClosure:precloseAlert", payload);
  }
}

function startPreCloseScheduler() {
  if (preCloseTimer) return;

  void runPreCloseSchedulerTick().catch((error) => {
    console.error("[Scheduler] preclose tick failed", error);
  });

  preCloseTimer = setInterval(() => {
    void runPreCloseSchedulerTick().catch((error) => {
      console.error("[Scheduler] preclose tick failed", error);
    });
  }, PRE_CLOSE_TICK_MS);
}

function stopPreCloseScheduler() {
  if (!preCloseTimer) return;
  clearInterval(preCloseTimer);
  preCloseTimer = null;
}

app.whenReady().then(() => {
  registerAllIpcHandlers();
  createWindow();
  startPreCloseScheduler();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on("window-all-closed", async () => {
  stopPreCloseScheduler();
  await disconnectPrisma();
  if (process.platform !== "darwin") app.quit();
});
