var ipcRenderer = require('electron').ipcRenderer;
var fs = require('fs');
var exec = require('child_process').exec;

//button to toggle tool menu
$("#menu-toggle").click(function(e) {
    e.preventDefault();
    $("#wrapper").toggleClass("toggled");
});

//button to create .bin file
$("#create-toggle").click(function(e) {
    e.preventDefault();
    var text = $('#duckscript').val();

    ipcRenderer.send('get-home-path');
    ipcRenderer.on('return-home-path', function(event, data) {
        var homePath = data;

        fs.writeFile(`${data}/inject.txt`, text, function(err){
            if (err) {
                console.log(err);
            }
        });

        exec(`java -jar encoder.jar -i ${data}/inject.txt -o ${data}/inject.bin`, function(err, stdout, stderr) {
            err = stderr || err;
            if (err) { return alert("There was an error: " + err); }
            console.log(stdout);
            if (stdout) {
                $("#message").text(stdout);
                $("#message2").text("Files written to: " + homePath);
                $("#myModal").modal('show');
            }
        });
    });
});