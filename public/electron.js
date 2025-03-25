const { app, BrowserWindow } = require('electron');
const path = require('path');

let mainWindow;

app.whenReady().then(() => {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    icon: path.join(__dirname, 'icon.png'), // Replace with your app icon
    webPreferences: {
      nodeIntegration: false, // Security best practice
      contextIsolation: true,
    },
  });

  mainWindow.loadURL(`file://${path.join(__dirname, '../build/index.html')}`);

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
