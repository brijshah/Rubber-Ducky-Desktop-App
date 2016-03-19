'use strict';

var app = require('app');
var BrowserWindow = require('browser-window');
var Menu = require("menu");

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

    //create and load toolbar
    var toolbar = [{
        label: "Rubber Ducky Toolkit",
        submenu: [
            { label: "About Application", selector: "orderFrontStandardAboutPanel:" },
            { type: "separator" },
            { label: "Quit", accelerator: "Command+Q", click: function() { app.quit(); }}
        ]},
        {
        label: "Edit",
        submenu: [
            { label: "Undo", accelerator: "CmdOrCtrl+Z", selector: "undo:" },
            { label: "Redo", accelerator: "Shift+CmdOrCtrl+Z", selector: "redo:" },
            { type: "separator" },
            { label: "Cut", accelerator: "CmdOrCtrl+X", selector: "cut:" },
            { label: "Copy", accelerator: "CmdOrCtrl+C", selector: "copy:" },
            { label: "Paste", accelerator: "CmdOrCtrl+V", selector: "paste:" },
            { label: "Select All", accelerator: "CmdOrCtrl+A", selector: "selectAll:" }
        ]},
        {
        label: "View",
        submenu: [
            { label: "Reload", accelerator: "CmdOrCtrl+R", click: function(item, focusedWindow) {if (focusedWindow){focusedWindow.reload();}}},
            {
                label: 'Toggle Full Screen',
                accelerator: (function() {
                  if (process.platform == 'darwin')
                    return 'Ctrl+Command+F';
                  else
                    return 'F11';
                })(),
                click: function(item, focusedWindow) {
                  if (focusedWindow)
                    focusedWindow.setFullScreen(!focusedWindow.isFullScreen());
                }
            },
            {
                label: 'Toggle Developer Tools',
                accelerator: (function() {
                  if (process.platform == 'darwin')
                    return 'Alt+Command+I';
                  else
                    return 'Ctrl+Shift+I';
                })(),
                click: function(item, focusedWindow) {
                  if (focusedWindow)
                    focusedWindow.toggleDevTools();
                }
            }
        ]},
        {
        label: "Window",
        role: 'window',
        submenu: [
            { label: "Minimize", accelerator: "CmdOrCtrl+M", selector: "minimize:" },
            { label: "Close", accelerator: "CmdOrCtrl+W", selector: "close:" }
        ]}
    ];
    Menu.setApplicationMenu(Menu.buildFromTemplate(toolbar));
});

// Quit when all windows are closed.
app.on('window-all-closed', function () {
  // On OS X it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit();
  }
});