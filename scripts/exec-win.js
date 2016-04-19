var shell = require('powershell');

module.exports = function execWin (command, cb) {
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
};