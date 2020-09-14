const { app, BrowserWindow } = require('electron');

function appReady(){
    //create the main window.
    const window = new BrowserWindow({
        width: 800,
        height: 800,
        webPreferences: {
            nodeIntegration: true
        }
    });
    window.loadFile('mainApp.html');
    window.removeMenu();
}

app.whenReady().then(appReady).catch(() => {console.log("catastrophic faliure")});