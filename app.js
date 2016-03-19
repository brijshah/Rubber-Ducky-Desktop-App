'use strict';

var app = require('app');
var BrowserWindow = require('browser-window');

var mainWindow = null;

app.on('ready', function() {
    var mainWindow = new BrowserWindow({
        title: 'URB',
        width: 800,
        height: 600,
        'titleBarStyle': 'hidden'
    });
    mainWindow.loadURL('file://'+__dirname+'/index.html');
    //mainWindow.openDevTools() //opens inspect console
});

// Quit when all windows are closed.
app.on('window-all-closed', function () {
  // On OS X it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit();
  }
});