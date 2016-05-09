var ipcRenderer = require('electron').ipcRenderer;
var fs = require('fs');
var exec = require('child_process').exec;

//button to toggle tool menu
$("#menu-toggle").click(function(e) {
    e.preventDefault();
    $("#wrapper").toggleClass("toggled");
});

//button to create .bin file
var $createBtn = $("#create-toggle");
var $textarea = $('#duckscript');

$createBtn.click(function(e) {
    e.preventDefault();
    ipcRenderer.send('get-home-path');
});

$textarea.on("input", checkCreateBtnState);

function checkCreateBtnState (enable) {
    if (enable === false && enable !== true || $textarea.val().trim()) {
        $createBtn.removeAttr("disabled");
    } else {
        $createBtn.attr("disabled", "disabled");
    }
}
checkCreateBtnState();

ipcRenderer.on('return-home-path', function(event, data) {
    var homePath = data;

    checkCreateBtnState(false);

    fs.writeFile(`${data}/inject.txt`, $textarea.val(), function(err){
        if (err) {
            return alert("There was an error: " + err.message);
        }
        exec(`java -jar encoder.jar -i ${data}/inject.txt -o ${data}/inject.bin`, function(err, stdout, stderr) {
        //exec(`java -jar ${process.resourcesPath}/app/encoder.jar -i ${data}/inject.txt -o ${data}/inject.bin`, function(err, stdout, stderr) {
            checkCreateBtnState(true);
            err = stderr || err;
            if (err) { return alert("There was an error: " + err); }
            if (stdout) {
                $("#message").text(stdout);
                $("#message2").text("Files written to: " + homePath);
                $("#myModal").modal('show');
            }
        });
    });
});