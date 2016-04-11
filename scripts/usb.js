var os = require('os');
var exec = require('child_process').exec;
var sudo = require("electron-sudo");
var shell = require('powershell');

// Get the UI elements from the DOM (using jQuery)
var $errorMessage = $(".process-error.alert")
  , $messageSpan = $(".error-message", $errorMessage)
  , $info = $("#info")
  , $volumeName = $("#volumename")
  ;

function execWin (command, cb) {
    var PS = new shell(command);
    var stdout = "";
    var stderr = "";

    PS.on("end", function (code) {
        if (code !== 0) {
            return cb(new Error("Failed to run the command."), "", "");
        }
        cb(stderr || null, stdout, "");
    });

    PS.on("error-output", function (data) {
        stderr += data;
    });


    PS.on('output', function(data) {
        stdout += data;
    });
}

// menu toggle
$("#menu-toggle").click(function(e) {
    e.preventDefault();
    $("#wrapper").toggleClass("toggled");
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

// Shows the success message that we prvide
function showSuccess(msg) {
    $successAlert.removeClass("hide").fadeIn();
    $successMessage.text(msg);
}


function updateProcessOutputInUi (err, stdout) {

    // First, hide the alert messages
    $errorMessage.hide();
    $successAlert.hide();

    // If there is an error, show it
    if (err) {
        $messageSpan.text(err);
        $errorMessage.removeClass("hide").fadeIn();
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
        sudo.exec("eject /dev/" + volume, cb);
    } else if (process.platform === 'win32' || process.platform === 'win64') {
        execWin("$driveEject = New-Object -comObject Shell.Application; $driveEject.Namespace(17).ParseName(\"" + volume + "\").InvokeVerb(\"Eject\"); echo '';", cb);
       // execWin("", cb);
    } else {
        cb("This platform is not supported.");
    }
}

$("#ejectbtn").click(function() {
    // Eject the USB
    ejectUSB($volumeName.val(), function (err, data) {
        // ...and after trying to eject the volume
        // check for error and show it (if there is one)
        if (err) { return updateProcessOutputInUi(err); }

        // ...or update the stdout
        updateProcessOutputInUi(null, data);

        // and show the success message
        showSuccess("The usb was ejected.");
    });
});