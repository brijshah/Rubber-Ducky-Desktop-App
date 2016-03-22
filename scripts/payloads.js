// //hide options
// $("#winRec").hide();
// $("#winExp").hide();
// $("#winReport").hide();

//Menu toggle
$("#menu-toggle").click(function(e) {
    e.preventDefault();
    $("#wrapper").toggleClass("toggled");
});

$("#winOption").click(function(){
    osxHide();
    linuxHide();
    $("#winRec").show();
    $("#winExp").show();
    $("#winReport").show();
});

// osxOption click event
// hide
// show osx stuff
$("#osxOption").click(function() {
    winHide();
    linuxHide();
    $("#osxRec").show();
    $("#osxExp").show();
    $("#osxReport").show();
});

// linuxOption click event
// hide()
// show linux stuff
$("#linuxOption").click(function() {
    winHide();
    osxHide();
    $("#linuxRec").show();
    $("#linuxExp").show();
    $("#linuxReport").show();
});

var winHide = function() {
    // win hide
    $("#winRec").hide();
    $("#winExp").hide();
    $("#winReport").hide();
}

var osxHide = function() {
    $("#osxRec").hide();
    $("#osxExp").hide();
    $("#osxReport").hide();
}

var linuxHide = function() {
    $("#linuxRec").hide();
    $("#linuxExp").hide();
    $("#linuxReport").hide();
}