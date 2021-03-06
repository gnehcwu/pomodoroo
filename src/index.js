const { app, BrowserWindow, ipcMain, Notification } = require('electron');
const path = require('path');
const TrayGenerator = require('./trayGenerator');

let mainWindow = null;
let tray = null;

const handleNotification = async () => {
  ipcMain.handle('notification', async (_, { title, body, actions }) => {
    let res = await new Promise((resolve) => {
      let notification = new Notification({
        title,
        body,
        actions,
        silent: true
      });
      notification.show();
      notification.on('action', () => {
        resolve({ event: 'action' });
      });
      notification.on('close', () => {
        resolve({ event: 'close' });
      });
    });
    return res;
  });
}

const handleWindowBlur = () => {
  mainWindow.on('blur', () => {
    mainWindow.hide();
  });
}

const createWindow = () => {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: 215,
    height: 290,
    backgroundColor: '#FFF',
    resizable: false,
    frame: false,
    show: false,
    fullscreenable: false,
    webPreferences: {
      nodeIntegration: true,
      enableRemoteModule: true,
    },
  });

  // and load the index.html of the app.
  mainWindow.loadFile(path.join(__dirname, 'index.html'));
};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', () => {
  handleNotification();
  createWindow();
  handleWindowBlur();
  tray = new TrayGenerator(mainWindow);
  tray.createTray();
});

if (app.dock) app.dock.hide();
