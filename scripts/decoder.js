var ipcRenderer = require('electron').ipcRenderer;
var exec = require('child_process').exec;

//button to toggle tool menu
$("#menu-toggle").click(function(e) {
    e.preventDefault();
    $("#wrapper").toggleClass("toggled");
});

//button action to recieve filename(and path)
$("#filepath").click(function(e) {
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
                { name: 'Binary Files', extensions: ['bin'] }
            ],
            defaultPath : path
        }
        ipcRenderer.send('main-open-file',args);
        ipcRenderer.on('returnDialogMainOpenFile', function(event,data){
            //console.log(data[0]);
            exec(`python DuckDecoder.py decode ${data[0]}`, function(err, stdout, stderr) {
                $("#duckscript").val(stdout);
            });
        });
    });
});

