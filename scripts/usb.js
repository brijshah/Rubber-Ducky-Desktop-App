var os = require('os');
var exec = require('child_process').exec;
var sudo = require("electron-sudo");
var execWin = require("../scripts/exec-win");
var isRoot = require('is-root');
var ipcRenderer = require('electron').ipcRenderer;

// Get the UI elements from the DOM (using jQuery)
var $errorMessage = $(".process-error.alert")
  , $messageSpan = $(".error-message", $errorMessage)
  , $info = $("#info")
  , $volumeName = $("#volumename")
  , $volumeName1 = $("#volumename1")
  ;

// menu toggle
$("#menu-toggle").click(function(e) {
    e.preventDefault();
    $("#wrapper").toggleClass("toggled");
});

if (process.platform === 'linux'){
    $("#linuxmount").show();
} else {
    $("#linuxmount").hide();
}

$("#mountbutton").click(function(e) {
    e.preventDefault();
    exec("mount /dev/" + $volumeName1 + " /mnt");
});

$("#unmountbutton").click(function(e) {
    e.preventDefault();
    exec(`umount /mnt`);
});

// function that returns a function.
// It gets as parameter the callback function (the original) and returns another function that gets
// as input the output from exec method: err, stdout, stderr
// Finally, it will call the original callback function with the error (if any) and stdout.
function handleCallback(cb) {
    return function (err, stdout, stderr) {
        cb(stderr || err, stdout);
    };
}

function listUsb (cb) {
    cb = handleCallback(cb);
 if (process.platform === 'darwin') {
        exec("diskutil list", cb);
    } else if (process.platform === 'linux') {
        exec("lsblk", cb);
    } else if (process.platform === 'win32' || process.platform === 'win64') {
        execWin("gwmi cim_logicaldisk | ? drivetype -eq 2", cb);
    } else {
        cb("Error obtaining device list. Try Again.");
    }
}

// The success alert and message elements
var $successAlert = $(".process-success");
var $successMessage = $(".success-message", $successAlert);

// Shows the success message that we provide
function showSuccess(msg) {
    $successAlert.removeClass("hide").fadeIn();
    $successMessage.text(msg);
}

// Shows the error message in alert
function showError (msg) {
    $messageSpan.text(msg);
    $errorMessage.removeClass("hide").fadeIn();
}

// Shows the error/success alert
function showErrorOrSuccess (err, success) {
    err ? showError(err) : showSuccess(success);
}

function updateProcessOutputInUi (err, stdout) {

    // First, hide the alert messages
    $errorMessage.hide();
    $successAlert.hide();

    // If there is an error, show it
    if (err) {
        showError(err);
    } else {
        // Otherwise, show the output in the $info element
        $info.text(stdout);
    }
}

$("#listbtn").click(function() {
    // The listUsb function takes the callback function as parameter (callback)
    // The updateProcessOutputInUi will be called after getting the data from listUsb
   listUsb(updateProcessOutputInUi);
});

// This function will eject the specified volume
function ejectUSB (volume, cb) {
    // Prepare the callback
    cb = handleCallback(cb);
    if (process.platform === 'darwin') {
        exec(`diskutil eject /Volumes/${volume}`, cb);
    } else if (process.platform === 'linux') {
        if(isRoot) {
            exec("eject /dev/" + volume, cb);
        } else {
            sudo.exec("eject /dev/" + volume, cb);
        }
    } else if (process.platform === 'win32' || process.platform === 'win64') {
        execWin("$driveEject = New-Object -comObject Shell.Application; $driveEject.Namespace(17).ParseName(\"" + volume + "\").InvokeVerb(\"Eject\"); echo '';", cb);
    } else {
        cb("This platform is not supported.");
    }
}

$("#ejectbtn").click(function() {
    // Eject the USB
    ejectUSB($volumeName.val(), function (err, data) {

        if(err && /^You cannot call a method on a null\-valued expression/.test(err)) {
            err = "USB not found.";
        }

        // ...and after trying to eject the volume
        // check for error and show it (if there is one)
        if (err) { return updateProcessOutputInUi(err); }

        // ...or update the stdout
        updateProcessOutputInUi(null, data);

        // and show the success message
        showSuccess("The usb was ejected.");
    });
});

// Returns the volume path
function getVolumePath (volume) {
    if(process.platform == 'darwin') {
        return `/Volumes/${volume}`;
    } else if (process.platform === 'linux') {
        return `/dev/${volume}`;
    } else if (process.platform === 'win32') {
        return `${volume}:\\`;
    }
}

// Moves the file from usb to computer
function moveFromUsb (volPath, dest) {
    var cb = handleCallback(showErrorOrSuccess);
    if(process.platform == 'darwin') {
        exec("mv " + volPath + " " + dest, cb);
    } else if (process.platform === 'linux') {
        exec("mv " + volPath + " " + dest, cb);
        // run always: command1; command2
        // run only if first was successful: command1 && command2
    } else if (process.platform === 'win32') {
        execWin("Copy-Item -Recurse " + volPath + " " + dest + "; Remove-Item -Recurse " + volPath, cb);
    }
}

// Copies the file from the computer to usb
function copyToUsb (source, volume) {
    var cb = handleCallback(showErrorOrSuccess);
    if (!volume.trim()) {
        return cb("Please select a destination volume.");
    }

    var volPath = getVolumePath(volume);
    if(process.platform == 'darwin') {
        exec("cp " + source + " " + volPath, cb);
    } else if (process.platform === 'linux') {
        exec("cp " + source + " " + "/mnt", cb);
    } else if (process.platform === 'win32') {
        execWin("Copy-Item -Recurse " + source + " " + volPath, cb);
    }
}

// Get volume name from textbox
var $vol2 = $("#vol2");
var $vol3 = $("#vol3");

function getVolumeName ($cInput) {
    return $cInput.attr("id") === "copyfrom" ? $vol3.val() : $vol2.val();
}

// These are helper variables:
// ...is copy from clicked
var _isCopyFrom = false;
// Volume path (e.g. /Volumes/USB)
var _volumePath = null;
// Home path (e.g. /Users/foo)
var _homePath = null;
// Volume name (e.g. USB)
var _volumeName = null;

$("#copyto, #copyfrom").click(function(e){
    e.preventDefault();
    var $this = $(this);
    _isCopyFrom = $this.attr("id") === "copyfrom";
    _volumeName = getVolumeName($this);
    _volumePath = getVolumePath(_volumeName);
    ipcRenderer.send('get-app-paths');
});

ipcRenderer.on('return-app-paths',function(event,data){
    var home = _homePath = data.home;
    var path = data.home;

    var args = {
        title : 'Open File',
        properties : ['openFile'],
        filters: [
            { name: 'Bin Files', extensions: ['bin'] }
        ],
        defaultPath : _isCopyFrom ? _volumePath : path
    };
    ipcRenderer.send('main-open-file',args);
});

ipcRenderer.on('returnDialogMainOpenFile', function(event,data){
    if (!data) { return; }
    var file = data[0];
    if (_isCopyFrom) {
        // Copy from usb to computer (move)
        moveFromUsb(file, _homePath);
    } else {
        // Copy from computer to volume (usb)
        copyToUsb(file, _volumeName);
    }
});