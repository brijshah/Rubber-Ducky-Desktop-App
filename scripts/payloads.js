// Hide download button until payload is generated
$('#downloadBin').hide();

//Menu toggle
$("#menu-toggle").click(function(e) {
    e.preventDefault();
    $("#wrapper").toggleClass("toggled");
});

// toggle windows payloads and hide others
$("#winOption").click(function(){
    osxHide();
    linuxHide();
    $("#winRec").show();
    $("#winExp").show();
    $("#winReport").show();
});

//toggle osx payloads and hide others
$("#osxOption").click(function() {
    winHide();
    linuxHide();
    $("#osxRec").show();
    $("#osxExp").show();
    $("#osxReport").show();
});

//toggle linux payloads and hide others
$("#linuxOption").click(function() {
    winHide();
    osxHide();
    $("#linuxRec").show();
    $("#linuxExp").show();
    $("#linuxReport").show();
});

var winHide = function() {
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

// Click handler
$("#create-payload").click(function(){
    // Get the selected platform
    // => "osx", "linux", "win"
    var platformSelected = $("input[name=optradio]:checked").attr("id").replace("Option", ""); // "osx", "linux", "win"

    // Get the dropdown element for that selected platform
    var $dropdown = $("#" + platformSelected + "Rec").find(".dropdown-menu");

    // Get the selected value in the dropdown
    var recValue = $dropdown.data("value");

    // Get the divider and selected option elements
    var $divider = $("li.divider", $dropdown);
    var $selectedValue = $("li[data-value='" + recValue + "']", $dropdown);

    // Get the report value (from the second dropdown)
    var reportValue = $("#" + platformSelected + "Report").find(".dropdown-menu").data("value");

    // Handle the win -> windows case
    var os = platformSelected;
    if (os === "win") {
        os = "windows";
    }

    // Get the type (exploit or recon)
    var type = $selectedValue.index() > $divider.index() ? "exploit" : "recon";

    // Build the path
    var path = "../files/payloads/" + os + "/" + type + "/" + recValue + "/" + reportValue + "/inject.zip";

    console.log(path);

    // Set the path and show the download button button
    $("#downloadBin").attr("href", path).show();
});

// Set the value on the dropdown
$(".dropdown-menu li > a").on("click", function () {
   var $this = $(this);
   var $li = $this.closest("li");
   var value = $li.data("value");
   if (!value) { return; }
   $this.closest(".dropdown-menu").attr("data-value", value);
   // Update the selected item
   $this.closest(".btn-group").find("span[data-bind='label']").text($this.text());
});