import { app, BrowserWindow } from "electron";
import path from "node:path";
import { registerAllIpcHandlers, disconnectPrisma, hasOpenCashRegister } from "./ipcHandlers";
import { getCashClosureReminderConfig } from "./cashClosureReminderConfig";

const PRE_CLOSE_CHANNEL = "cashClosure:preCloseReminder";
const PRE_CLOSE_TICK_MS = 10_000;

let preCloseInterval: NodeJS.Timeout | null = null;
let lastNotifiedBusinessDate: string | null = null;

function getBusinessDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function isAtOrAfterWindow(date: Date, time: string): boolean {
  const [hourPart, minutePart] = time.split(":");
  const configuredHour = Number(hourPart);
  const configuredMinute = Number(minutePart);
  const hours = date.getHours();
  const minutes = date.getMinutes();
  return hours > configuredHour || (hours === configuredHour && minutes >= configuredMinute);
}

async function evaluateAndNotifyPreClose() {
  const now = new Date();
  const config = getCashClosureReminderConfig();

  if (!isAtOrAfterWindow(now, config.reminderTime)) {
    return;
  }

  const businessDate = getBusinessDate(now);
  if (lastNotifiedBusinessDate === businessDate) {
    return;
  }

  const hasOpenRegister = await hasOpenCashRegister();
  if (!hasOpenRegister) {
    return;
  }

  const windows = BrowserWindow.getAllWindows();
  for (const window of windows) {
    window.webContents.send(PRE_CLOSE_CHANNEL, {
      businessDate,
      triggeredAt: now.toISOString(),
      scheduledTime: config.reminderTime,
    });
  }

  lastNotifiedBusinessDate = businessDate;
}

function startPreCloseScheduler() {
  if (preCloseInterval) {
    clearInterval(preCloseInterval);
  }

  void evaluateAndNotifyPreClose();
  preCloseInterval = setInterval(() => {
    void evaluateAndNotifyPreClose();
  }, PRE_CLOSE_TICK_MS);
}

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
  startPreCloseScheduler();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on("window-all-closed", async () => {
  if (preCloseInterval) {
    clearInterval(preCloseInterval);
    preCloseInterval = null;
  }
  await disconnectPrisma();
  if (process.platform !== "darwin") app.quit();
});
