const { app, BrowserWindow , ipcMain} = require('electron');
let mainWindow, examWindow, observerWindow;

function appReady(){
    //create the main window.
    mainWindow = new BrowserWindow({
        width: 1200,
        height: 800,
        webPreferences: {
            nodeIntegration: true
        }
    });
    mainWindow.loadFile('./main_page/mainApp.html');
    mainWindow.removeMenu();
};

ipcMain.on("asynchronous-message" , (event,arg) => {
    if(event.frameId == 1){
        console.log(arg);
        startExam(arg);
    }
});


function startExam(examData){
    mainWindow.hide();
    examWindow = new BrowserWindow({
        width:1300, 
        height:800,
        show: false,
        webPreferences: {
            nodeIntegration: true,
        }
    });
    observerWindow = new BrowserWindow({
        width: 1300,
        height:800,
        webPreferences: {
            nodeIntegration: true,
        }
    });
    examWindow.maximize();
    examWindow.removeMenu();
    examWindow.loadFile("./exam_page/exam_page.html");
    examWindow.webContents.openDevTools();
    examWindow.show();
    observerWindow.hide();
    observerWindow.loadFile("./exam_page/observer.html");
    ipcMain.on("data-req", (event,arg) => {
        event.sender.send("data-rep", examData);
    });
    observerWindow.webContents.on("did-finish-load" , () => {
        ipcMain.on("start-exam" , (event,arg) => {
            observerWindow.webContents.send("start-exam-observer");
            ipcMain.on("start-exam-started",(event,arg) => {
                examWindow.webContents.send("observation-started");
            });
            ipcMain.on("cheat-auto-fail" , (event,arg) => {
                examWindow.webContents.send("cheat-auto-fail");
            })
            ipcMain.on("visibilty-change", (event, arg) => {
                observerWindow.webContents.send("visibilty-change");
            })
            ipcMain.on("screen-size-change", (event, arg) => {
                observerWindow.webContents.send("screen-size-change");
            })
        });
    })
}

app.whenReady().then(appReady).catch(() => {console.log("catastrophic faliure")});