const { app, BrowserWindow, Menu, dialog } = require('electron');
const path = require('path');
const pkg = require('./package.json'); // autosync ver from package

let windows = [];
let isQuitting = false;

// Confetti
function launchConfetti() {
  const mainWin = BrowserWindow.getFocusedWindow();
  const bounds = mainWin?.getBounds();

  const overlay = new BrowserWindow({
    width: 400,
    height: 300,
    x: bounds ? bounds.x + Math.floor((bounds.width - 400) / 2) : undefined,
    y: bounds ? bounds.y + Math.floor((bounds.height - 300) / 2) : undefined,
    frame: false,
    transparent: true,
    alwaysOnTop: true,
    skipTaskbar: true,
    hasShadow: false,
    resizable: false,
    focusable: false,
    fullscreenable: false,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true
    }
  });

  overlay.loadFile(path.join(__dirname, 'confetti.html'));
  setTimeout(() => {
    if (!overlay.isDestroyed()) overlay.close();
  }, 2000);
}

//Quit interceptor
app.on('before-quit', (event) => {
  if (!isQuitting && BrowserWindow.getAllWindows().length <= 1) {
    event.preventDefault();
    const choice = dialog.showMessageBoxSync({
      type: 'question',
      buttons: ['Cancel', 'Quit'],
      defaultId: 1,
      cancelId: 0,
      message: 'Are you sure you want to quit wasteof.money? Touching grass is lame...'
    });

    if (choice === 1) {
      isQuitting = true;
      app.quit();
    }
  }
});

function createWindow() {
  const offsetX = Math.floor(Math.random() * 300);
  const offsetY = Math.floor(Math.random() * 300);

  const win = new BrowserWindow({
    width: 1000,
    height: 800,
    x: offsetX,
    y: offsetY,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true
    }
  });

  win.loadURL('https://wasteof.money');
  windows.push(win);

  win.on('close', (event) => {
    if (!isQuitting && windows.length === 1) {
      const choice = dialog.showMessageBoxSync(win, {
        type: 'question',
        buttons: ['Cancel', 'Quit'],
        defaultId: 1,
        cancelId: 0,
        message: 'Are you sure you want to quit wasteof.money? Touching grass is lame...'
      });

      if (choice !== 1) {
        event.preventDefault();
      } else {
        isQuitting = true;
        app.quit();
      }
    }
  });

  win.on('closed', () => {
    windows = windows.filter(w => w !== win);
  });

  const menu = Menu.buildFromTemplate([
    {
      label: 'App',
      submenu: [
        {
          label: 'About wasteof.money',
          click: () => {
            launchConfetti();
            setTimeout(() => {
              dialog.showMessageBox({
                type: 'info',
                title: 'About wasteof.money',
                message: `macOS desktop client for wasteof.money\n\nVersion ${pkg.version}`,
                buttons: ['OK']
              });
            }, 150);
          }
        },
        { type: 'separator' },
        {
          label: 'New Window',
          accelerator: 'CommandOrControl+N',
          click: () => createWindow()
        },
        { role: 'close' },
        {
          label: 'Quit App',
          accelerator: 'CommandOrControl+Q',
          click: () => {
            app.quit();
          }
        }
      ]
    },
    {
      label: 'Text',
      submenu: [
        { role: 'copy' },
        { role: 'paste' },
        { role: 'cut' },
        { role: 'selectAll' }
      ]
    },
    {
      label: 'Navigation',
      submenu: [
        {
          label: 'Back',
          accelerator: 'CommandOrControl+Left',
          click: () => {
            const win = BrowserWindow.getFocusedWindow();
            if (win && win.webContents.canGoBack()) win.webContents.goBack();
          }
        },
        {
          label: 'Forward',
          accelerator: 'CommandOrControl+Right',
          click: () => {
            const win = BrowserWindow.getFocusedWindow();
            if (win && win.webContents.canGoForward()) win.webContents.goForward();
          }
        },
        { type: 'separator' },
        { role: 'reload' }
      ]
    }
  ]);

  Menu.setApplicationMenu(menu);
}

app.whenReady().then(createWindow);
