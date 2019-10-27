// HIP Object customization object, verify function, 
// and callback functions for displaying items outside the control.

//-------------------------------------------------------------------------------------------------
// The following varible name is defined by partner
// Make sure it has no conflicts to any other your variable names.
// The name defined here influence how to generate get hip URL that has format "http://p.client.hip.live.com/GetHIP/GetWLSPHIP0/<the namedefined here>?". 
// Replace '<   >' there with the name here.  
// ------------------------------------------------------------------------------------------------
var WLSPHIP0 = {
    error: 0,
    left: "10",

    // ---------------------------------------------------------------------
    //Toggle to display instruction in frame or inside input box.
    // ---------------------------------------------------------------------
    showInstruction: true, //display instruction in the frame.

    getInstruction: function () { }, //implement internal.

    // -----------------------------------------------------------------------
    // For display Hip instruction in your designed place.
    // Remove this line it if you have no this requirement.
    // -----------------------------------------------------------------------
    instructionOutsideCallback: function (instruction) { /*instructionCallback(instruction)*/ }, //<---------------add instruction as parameter, and remove the expose get instruction from API.

    showMenu: true,
    getMenu: function () { }, //return a json object  { 'refresh': item1, 'proofType': item2};//internal use.

    // -----------------------------------------------------------------------
    // For display Hip menu in your designed place.
    // Remove this line it if you have no this requirement.
    // -----------------------------------------------------------------------
    //menuOutsideCallback: function (menu) { refreshOutsideMenu(menu) }, //<----------------------add menu as parameter

    showError: false, //<--------------------------- use showError for oppsite meaning

    // -----------------------------------------------------------------------
    // For display Hip Error in your designed place.
    // Remove this line it if you have no this requirement.
    // -----------------------------------------------------------------------
    //showErrorCallback: function (message) { var ele = document.getElementById('idError'); ele.innerHTML = message; },

    errorMessage: "", //internal use.

    // -----------------------------------------------------------------------
    // Remove Hip Error in your designed place.
    // Remove this line it if you have no this requirement.
    // -----------------------------------------------------------------------
    //removeErrorCallback: function () { var ele = document.getElementById('idError'); ele.innerHTML = ""; },

    instructionsInside: false, //instruction is displayed inside inputbox
    getError: function () { },

    inputWidth: 245,
    done: false,

    // --------------------------------------------------------------------------------------------------------
    // holder element id.
    // Search ispHIPHIP in this page for where it is.
    // use your own name in your page and make sure that no conflicts to your other element id.
    //---------------------------------------------------------------------------------------------------------
    holder: "ispHIPHIP",

    // --------------------------------------------------------------------------------------------------------
    // holder element id.
    // Search ispHIPHIP in this page for where it is.
    // use your own name in your page and make sure that no conflicts to your other element id.
    //---------------------------------------------------------------------------------------------------------
    scriptHolder: "ispHIPScript",
    count: 0,
    type: "visual",
    market: "en-us",

    // ---------------------------------------------------------------------------------------------------------
    // If you have defined custom CSS classes for HIP elements,
    // you can set them here to override the default style. 
    // (Blocked out for test purposes)
    // ----------------------------------------------------------------------------------------------------------
//      cssSet: {
//      cssCdHIPMenu: "csshMenu1",
//      cssCdHIPInput: "csshInput1",
//      cssCdHIPLink: "csshLink1",
//      cssCdHIPError: "csshError1",
//      cssCdHIPErrorImg: "csshErrorImg1"
//      },

    getSolution: function () { },
    reloadHIP: function () { },
    switchHIP: function () { },
    clientValidation: function () { },
    setError: function () { },
    setFocus: function () { },

    // --------------------------------------------------------------------------------------------------------
    // This function is always called after Hip is loaded.
    // Do whatever you think reasonable for you.
    // ---------------------------------------------------------------------------------------------------------
    postLoad: function () {
        // After verify Hip failed in server side. You have chance to decide to display 
        // error message or not. If you want to refresh whole Page when this happen, you may not want to display error message.
        // then set this.error = 0; 

        //this line makes sure the focus is on the solution input box. do it if you want to.
        var f = this.setError();
        if (f != "")
            document.getElementById(f).focus();

    },
    verify: function (theCallback, param) { }
};

// ------------------------------------------------------------------------------------------------------------------
// submit call back function.
// use your own name.
// ------------------------------------------------------------------------------------------------------------------
var verifyOnClient = function (solution, token, param) {
    WLSPHIP0.clientValidation();

    if (WLSPHIP0.error != "0") {
        return;
    }
    else {
        fillHipData(solution, token);

        //document.getElementById('Solution').value = solution;
        //document.getElementById('Token').value = token;
        //document.getElementById('Type').value = WLSPHIP0.type;
        return;
    }
}

var fillHipData = function (solution, token) {
    document.getElementById('Solution').value = solution;
    document.getElementById('Token').value = token;
    document.getElementById('Type').value = WLSPHIP0.type;
}

// -----------------------------------------------------------------------------------------------------------------
// call back for display Hip menu in your own way.
// Remove this function if you do not need to manage menu yourself.
// ise your own name if you want to do it.
// ---------------------------------------------------------------------------------------------------------------
function refreshOutsideMenu(menu) {
    //as demo, predefined 4 menu items.
    //Actually we do not know how many we have for future.
    //so in your application dynamic create them.
    for (var i = 0; i < 4; i++) {
        (function (i) {
            var ele = document.getElementById('idMenu' + i);
            ele.innerHTML = "";
            ele.title = "";
            ele.onclick = function () { };
        })(i);
    }

    //set if needed
    var itemLength = menu.length;
    if (!WLSPHIP0.showMenu) {
        //var menu = WLSPHIP0.getMenu();

        for (var j = 0; j < itemLength; j++) {
            (function (j) {

                var ele = document.getElementById('idMenu' + j);
                ele.innerHTML = menu[j].text;
                ele.title = menu[j].tip;
                var trigger = menu[j].trigger;
                ele.onclick = function () { trigger(); return false };

            })(j);

        }
    }

}

// -----------------------------------------------------------------------------------------------------------------
// call back for display Hip instruction in your own way.
// Remove this function if you do not need to do it.
// ise your own name if you want to do it.
// ---------------------------------------------------------------------------------------------------------------
function instructionCallback(instruction) //add instruction as parameter, and remove the expose get instruction from API.
{
    if (WLSPHIP0.showInstruction) {
        document.getElementById('idInstruction').innerHTML = '';
    }
    else {
        //var instruction = WLSPHIP0.getInstruction();
        document.getElementById('idInstruction').innerHTML = instruction;
    }
}

if (!$.ajax) {
    $.ajax = () => {};
}