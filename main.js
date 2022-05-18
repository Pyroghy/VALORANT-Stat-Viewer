const { app, BrowserWindow } = require('electron');
const path = require('path');

function createWindow() {
    const window = new BrowserWindow({
        width: 1286,
        height: 749,

        center: true,
        autoHideMenuBar: true,
        resizable: false,
        fullscreenable: false,
        hasShadow: false,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            contextIsolation: false,
            nodeIntegration: true,

        }
    })

    //window.webContents.openDevTools()
    window.loadFile('index.html')
}

app.whenReady().then(() => {
    createWindow()

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow()
        }
    })
})

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit()
    }
})