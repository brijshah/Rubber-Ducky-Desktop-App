var ipcRenderer = require('electron').ipcRenderer;
var exec = require('child_process').exec;
var os = require('os');
var shell = require('powershell');

var showProcessOutput = checkOutput(showErrorOrSuccess);
var $outputAlert = $(".process-output-alert")
  , $alertTypeMsg = $(".alert-type-msg", $outputAlert)
  , $alertMessage = $(".alert-message", $outputAlert)
  ;

// Select all the buttons that run a command
var $execButtons = $("button");

$(document).on("click", ".alert .close", function () {
    $(this).closest(".alert").fadeOut();
});

//button to toggle tool menu
$("#menu-toggle").click(function(e) {
    e.preventDefault();
    $("#wrapper").toggleClass("toggled");
});

function execWin (command, cb) {
    var PS = new shell(command);
    var stdout = "";
    var stderr = "";

    PS.on("end", function (code) {
        if (code !== 0) {
            return cb(new Error("Failed to run the command."), "", "");
        }
        // Send the error  in the callback
        cb(stderr || null, stdout, "");
    });

    // Listen stderr data (errors from the child process)
    PS.on("error-output", function (data) {
        stderr += data;
    });

    PS.on('output', function(data) {
        stdout += data;
    });
}

//displays error or success message based on results from command
function showErrorOrSuccess (err, data) {
    $outputAlert.hide().removeClass("hide alert-danger alert-success");
    $outputAlert.addClass("alert-" + (err ? "danger" : "success")).fadeIn();
    $alertTypeMsg.text(err ? "Error!" : "Success!");
    $alertMessage.text(err || data);
    enableButtons();
}

//checks the type of output from a command that is run
function checkOutput (cb) {
    return function (err, stdout, stderr) {
        // If the stderr contains "Validating...", then that's not an error
        if (stderr && /Validating\.\.\./.test(stderr)) {
            // Move the stderr content in stdout
            stdout = stderr;

            // Empty the stderr
            stderr = "";

            // Nulify the err obj
            err = null;
        }
        cb(stderr || err, stdout);
    };
}

//dump(backup) button action
$("#dumpbtn").click(function(){
    disableButtons();
    ipcRenderer.send('get-home-path');
});

ipcRenderer.on('return-home-path', function(event, data) {
    var homePath = data;

    if (process.platform === 'darwin') {
        exec(`dfu-programmer at32uc3b1256 dump > ${data}/dump.bin`, showProcessOutput);
    } else if (process.platform === 'linux') {
        exec(`dfu-programmer at32uc3b1256 dump > ${data}/dump.bin`, showProcessOutput);
    } else if (process.platform === 'win32' || process.platform === 'win64') {
        execWin(`dfu-programmer at32uc3b1256 dump > ${data}/dump.bin`, showProcessOutput);
    }
});

//erase button action
$("#erasebtn").click(function(){
    disableButtons();
    if (process.platform === 'darwin') {
        exec("dfu-programmer at32uc3b1256 erase", showProcessOutput);
    } else if (process.platform === 'linux') {
        exec("dfu-programmer at32uc3b1256 erase", showProcessOutput);
    } else if (process.platform === 'win32' || process.platform === 'win64') {
        execWin("dfu-programmer at32uc3b1256 erase", showProcessOutput);
    } else {
        checkOutput("Error erasing Ducky.")
    }
});

// Disable the buttons (function)
function disableButtons () {
    $execButtons.attr("disabled", "disabled");
}

// Enable the buttons (function)
function enableButtons () {
    $execButtons.removeAttr("disabled");
}

//button action to receive filepath for update
$("#updatebtn").click(function(e){
    e.preventDefault();
    ipcRenderer.send('get-app-paths');
});

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
});

ipcRenderer.on('returnDialogMainOpenFile', function(event,data){
    disableButtons();
    //console.log("parameters from the dialog:",data);
    if (process.platform === 'darwin') {
        exec(`dfu-programmer at32uc3b1256 flash --suppress-bootloader-mem ${data}`, showProcessOutput);
    } else if (process.platform === 'linux') {
        exec(`dfu-programmer at32uc3b1256 flash --suppress-bootloader-mem ${data}`, showProcessOutput);
    } else if (process.platform === 'win32' || process.platform === 'win64') {

    } else {
        checkOutput("Error updating Ducky.");
    }
});

//reset button action
$("#dresetbtn, #uresetbtn").click(function(){
    disableButtons();
    if (process.platform === 'darwin') {
        exec("dfu-programmer at32uc3b1256 reset", showProcessOutput);
    } else if (process.platform === 'linux') {
        exec("dfu-programmer at32uc3b1256 reset", showProcessOutput);
    } else if (process.platform === 'win32' || process.platform === 'win64') {

    } else {
        checkOutput("Error resetting Ducky");
    }
});