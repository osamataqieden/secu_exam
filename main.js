const { app, BrowserWindow } = require('electron');

function appReady(){
    //create the main window.
    const window = new BrowserWindow({
        width: 1200,
        height: 800,
        webPreferences: {
            nodeIntegration: true
        }
    });
    window.loadFile('mainApp.html');
    window.removeMenu();
    window.webContents.openDevTools();
};

app.whenReady().then(appReady).catch(() => {console.log("catastrophic faliure")});