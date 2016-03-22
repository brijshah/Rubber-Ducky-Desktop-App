var ipcRenderer = require('electron').ipcRenderer;

//button to toggle tool menu
$("#menu-toggle").click(function(e) {
    e.preventDefault();
    $("#wrapper").toggleClass("toggled");
});

//tooltip toggles for buttons
$('#dumpbtn').tooltip();
$('#erasebtn').tooltip();
$('#updatebtn').tooltip();
$('#resetbtn').tooltip();

//button action to receive filepath for update
$("#updatebtn").click(function(e){
    e.preventDefault();

    ipcRenderer.send('get-app-paths');
    ipcRenderer.on('return-app-paths',function(event,data){
        var home = data.home;
        var path = data.home,
        properties = ['openFile'],
        title = 'Open File';
        var args = {
            title : title,
            properties : properties,
            defaultPath : path
        }
        ipcRenderer.send('main-open-file',args);
        ipcRenderer.on('returnDialogMainOpenFile', function(event,data){
            console.log("parameters from the dialog:",data);
        });
    });
});