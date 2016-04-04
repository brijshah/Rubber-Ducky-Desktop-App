var ipcRenderer = require('electron').ipcRenderer;
var exec = require('child_process').exec;
var os = require('os');

var showProcessOutput = checkOutput(showErrorOrSuccess);
var $outputAlert = $(".process-output-alert")
  , $alertTypeMsg = $(".alert-type-msg", $outputAlert)
  , $alertMessage = $(".alert-message", $outputAlert)
  ;

//button to toggle tool menu
$("#menu-toggle").click(function(e) {
    e.preventDefault();
    $("#wrapper").toggleClass("toggled");
});

function showErrorOrSuccess (err, data) {
    $outputAlert.hide().removeClass("hide alert-danger alert-success");
    $outputAlert.addClass("alert-" + (err ? "danger" : "success")).fadeIn();
    $alertTypeMsg.text(err ? "Error!" : "Success!");
    $alertMessage.text(err || data);
}

function checkOutput (cb) {
    return function (err, stdout, stderr) {
        cb(stderr || err, stdout);
    };
}

//dump(backup) button action
$("#dumpbtn").click(function(){
    ipcRenderer.send('get-home-path');
    ipcRenderer.on('return-home-path', function(event, data) {
        var homePath = data;
        if (process.platform === 'darwin') {
            exec(`dfu-programmer at32uc3b1256 dump > ${data}/dump.bin`, showProcessOutput);
        } else if (process.platform === 'linux') {

        } else if (process.platform === 'win32' || process.platform === 'win64') {

        }
    });
});

//erase button action
$("#erasebtn").click(function(){
    if (process.platform === 'darwin') {
        exec("dfu-programmer at32uc3b1256 erase", showProcessOutput);
    } else if (process.platform === 'linux') {

    } else if (process.platform === 'win32' || process.platform === 'win64') {

    } else {
        //alert
    }
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
        };
        ipcRenderer.send('main-open-file',args);
        ipcRenderer.on('returnDialogMainOpenFile', function(event,data){
            //console.log("parameters from the dialog:",data);
            exec(`dfu-programmer at32uc3b1256 flash --suppress-bootloader-mem ${data}`, showProcessOutput);
        });
    });
});

//reset button action
$("#dresetbtn, #uresetbtn").click(function(){
    if (process.platform === 'darwin') {
        exec("dfu-programmer at32uc3b1256 reset", showProcessOutput);
    } else if (process.platform === 'linux') {

    } else if (process.platform === 'win32' || process.platform === 'win64') {

    } else {
        //alert
    }
});