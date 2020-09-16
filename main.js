const { app, BrowserWindow , ipcMain, ipcRenderer} = require('electron');
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
    mainWindow.webContents.openDevTools();
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
        ipcMain.on("exam-over" , (event , args) => {
            observerWindow.webContents.send("exam-over");
            ipcMain.on("shut-down" , (event,args) => {
                examWindow.send("shut-down-observer" , args);
                observerWindow.close();
                ipcMain.on("exam-results" , (event, args) => {
                    examWindow.close();
                    mainWindow.webContents.send("exam-done" , args);
                    ipcMain.on("exam-done-uploaded" , (event,args) => {
                        mainWindow.show();
                    })
                })
            });
        });
    })
}

app.whenReady().then(appReady).catch(() => {console.log("catastrophic faliure")});