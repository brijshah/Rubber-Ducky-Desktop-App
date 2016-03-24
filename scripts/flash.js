var ipcRenderer = require('electron').ipcRenderer;
var exec = require('child_process').exec;
var os = require('os');

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

//dump(backup) button action
$("#dumpbtn").click(function(){
    exec("dfu-programmer at32uc3b1256 dump > dump.bin", function(stderr) {
        console.log(stderr);
    });
});

//erase button action
$("#erasebtn").click(function(){
    exec("dfu-programmer at32uc3b1256 erase", function(stderr) {
        console.log(stderr);
    });
});

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
            filters: [
                { name: 'Hex Files', extensions: ['hex'] }
            ],
            defaultPath : path
        }
        ipcRenderer.send('main-open-file',args);
        ipcRenderer.on('returnDialogMainOpenFile', function(event,data){
            //console.log("parameters from the dialog:",data);
            exec(`dfu-programmer at32uc3b1256 flash --suppress-bootloader-mem ${data}`, function(stderr) {
                console.log(stderr);
            });
        });
    });
});

//reset button action
$("#resetbtn").click(function(){
    exec("dfu-programmer at32uc3b1256 reset", function(stderr) {
        console.log(stderr);
    });
});