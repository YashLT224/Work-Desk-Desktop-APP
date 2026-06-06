// WorkDesk — Electron main process.
// Reads/writes db.json directly (no server, no permission clicks).
const { app, BrowserWindow, ipcMain } = require('electron');
const fs = require('fs');
const path = require('path');

// In dev (npm start) db.json sits next to the app files; once packaged it
// lives in the OS user-data folder (a guaranteed-writable location).
function dbFile() {
  return app.isPackaged
    ? path.join(app.getPath('userData'), 'db.json')
    : path.join(__dirname, 'db.json');
}

ipcMain.handle('db:read', () => {
  try { return JSON.parse(fs.readFileSync(dbFile(), 'utf8')); }
  catch (e) { return null; }           // no file yet → app uses its defaults
});

ipcMain.handle('db:write', (_e, data) => {
  try { fs.writeFileSync(dbFile(), JSON.stringify(data, null, 2), 'utf8'); return true; }
  catch (e) { return false; }
});

ipcMain.handle('db:path', () => dbFile());

function createWindow() {
  const win = new BrowserWindow({
    width: 1240,
    height: 840,
    minWidth: 820,
    minHeight: 560,
    backgroundColor: '#1a1a2e',
    title: 'WorkDesk',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false
    }
  });
  win.loadFile('WorkDesk.html');
}

app.whenReady().then(createWindow);
app.on('window-all-closed', () => { if (process.platform !== 'darwin') app.quit(); });
app.on('activate', () => { if (BrowserWindow.getAllWindows().length === 0) createWindow(); });
