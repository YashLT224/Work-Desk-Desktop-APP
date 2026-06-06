// Exposes a tiny, safe API to the WorkDesk UI.
const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('workdesk', {
  readDB:  ()     => ipcRenderer.invoke('db:read'),
  writeDB: (data) => ipcRenderer.invoke('db:write', data),
  dbPath:  ()     => ipcRenderer.invoke('db:path')
});
