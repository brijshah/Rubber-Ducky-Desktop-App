var fs = require('fs');
var exec = require('child_process').exec;

// JQuery requires window
window.$ = window.jQuery = require('../assets/js/jquery.js');

//hide download button until create has been clicked
$('#downloadBin').hide();

//button to toggle tool menu
$("#menu-toggle").click(function(e) {
    e.preventDefault();
    $("#wrapper").toggleClass("toggled");
});

//button to create .bin file
$("#create-toggle").click(function(e) {
    e.preventDefault();
    $('#downloadBin').show();
    var text = $('#duckscript').val();
    fs.writeFile('./files/encoded/inject.txt', text, function(err){
        if (err) {
            console.log(err);
        }
    });
    exec(`java -jar encoder.jar -i ./files/encoded/inject.txt -o ./files/encoded/inject.bin`, function(error, stdout, stderr) {
        console.log(error);
        console.log(stdout);
        console.log(stderr);
    });
});