/* Formerly part of browse.js ; look there for svn history */

/*
When the picked/unpick button is clicked in the class details section
*/
function onPickUnpick(button) {
    // Check to see whether the class is currently picked by user
    var sectionID = button.getAttribute("sectionID");
    var picked = window.database.getObject(sectionID, "picked") == "true";
    // if the class is already picked, unpick it
    if (picked) {
	   doUnpick(sectionID);
       deleteClassFromStoredData(sectionID);
    // Otherwise, pick it
    } else {
	   doPick(sectionID);
       updateStoredDataFromExhibit();
    }
    updatePickedClassesList();
    editMiniTimegridTitles();
};

/*
When the "x"-button is clicked in the left sidebar
*/
function onUnpick(button) {
    var sectionID = button.getAttribute("sectionID");
    doUnpick(sectionID);
    deleteClassFromStoredData(sectionID);
    updatePickedClassesList();
    editMiniTimegridTitles();
};

/*
Gets the class from the sectionID
*/
function sectionIDtoClass(sectionID) {
    var db = window.database;
    var type = db.getObject(sectionID, "type");
    var classID = db.getObject(sectionID, sectionTypeToData[type].linkage);
    return classID;
}

// Does the actual picking of a class
function doPick(sectionID) {
    var db = window.database;
    updateCookie(sectionID, true);

    db.addStatement(sectionID, "picked", "true");
    db.removeStatement(sectionID, "temppick", "true");

    showHidePickDiv(sectionID, true);
    updateMiniTimegrid(false);
    
    logData(["picked", sectionID]);
}

//Does the actual unpicking of a class
function doUnpick(sectionID) {
    window.database.removeStatement(sectionID, "picked", "true");
    updateCookie(sectionID, false);
    
    showHidePickDiv(sectionID, false);
    updateMiniTimegrid(false);
    
    logData(["unpicked", sectionID]);
}

/*
Shows the classes on the timegrid when moused over pick
*/
function onMouseOverSection(div) {
    var sectionID = div.getAttribute("sectionID");
    if (window.database.getObject(sectionID, "picked") == null) {
        updateMiniTimegrid(true, sectionID);
    }
    editMiniTimegridTitles();
}

//Gets rid of the classes on the timegrid when no longer hovering over pick
function onMouseOutSection(div) {
    var sectionID = div.getAttribute("sectionID");
    if (window.database.getObject(sectionID, "picked") == null) {
        updateMiniTimegrid(true, null);
    }
    editMiniTimegridTitles();
}

//Changes the words in the button when a class is picked or unpicked
function showHidePickDiv(sectionID, picked) {
    var thediv = $("#divid-" + sectionID.split(".")[0] + "\\." + sectionID.split(".")[1]);
    if (thediv) {
        var className = picked ? "each-section-picked" : "each-section-unpicked";
        thediv.attr("class", className); 
        
        var button = thediv.find("button")[0];
        $(button).html(picked ? "Remove" : "Add");
    }
}

/*
Turns the cookie into a list of class objects
*/
function parseSavedClasses(classes) {
    var class_data = []
    if (classes != null) {
        var picked_classes = classes.split("+");
        for (c in picked_classes) {
            if (c != 0) {
                var data = picked_classes[c].split(",");
                var saved = new Object();
                for (i in data) {
                    var attr = data[i].split(":")[0];
                    var value = data[i].split(":")[1];
                    if (attr == "sectionID") 
                        saved.sectionID = value;
                    else if (attr == "color")
                        saved.color = value;
                    else if (attr == "type") 
                        saved.type = value;
                    else if (attr == "classID") 
                        saved.classID = value;
                    else if (attr == "classLabel")
                        saved.classLabel = value;
                    else if (attr == "timeandplace") 
                        saved.timeandplace = value;
                    else if (attr == "sectionData") 
                        saved.sectionData = value
		    else {
			saved.timeandplace += "," + attr;
		    }
                }
                class_data.push(saved);
            }
        }
    }
    return class_data;
}

/*
Turns the list of class objects to string for cookie
*/
function fromSavedClassesToCookie(classes) {
    var cookie = "";
    for (var c in classes) {
        var cd = classes[c];
        cookie = cookie + "+sectionID:" + cd.sectionID + ",color:" + cd.color
                + ",type:" + cd.type + ",classID:" + cd.classID + ",classLabel:" + cd.classLabel 
                + ",timeandplace:" + cd.timeandplace + ",sectionData:" + cd.sectionData;
    }
    writeCookie("picked-classes", cookie);
}

/*
Updates the saved classes cookie when a change is made
*/
function updateCookie(sectionID, add, classID, classLabel, timeAndPlace, type, sectionData) {
    var db =  window.database;

    var picked_classes = readCookie("picked-classes");
    var class_data = parseSavedClasses(picked_classes);
    var class_sectionIDs = class_data.map(function (element) { return element.sectionID });

    if (add) {
        var color = getNewColor();
        if (!classID) {
            // example: type = "LectureSession"
            var type = db.getObject(sectionID, "type");
            var sectionData = sectionTypeToData[type];
            // example: 7.012 = db.getObject(L017.012, "lecture-session-of");
            var classID = db.getObject(sectionID, sectionData.linkage);
            var classLabel = db.getObject(classID, "label");
            var timeandplace = db.getObject(sectionID, "timeAndPlace");
            db.addStatement(sectionID, "color", color);
        }

        if (class_sectionIDs.indexOf(sectionID) < 0) {
            if (picked_classes != null) {
            picked_classes = picked_classes + "+sectionID:" + sectionID + ",color:" + color 
                            + ",type:" + type + ",classID:" + classID + ",classLabel:" + classLabel 
                            + ",timeandplace:" + timeandplace + ",sectionData:" + sectionData.linkage;
            } else {
                picked_classes = "+sectionID:" + sectionID + ",color:" + color
                                + ",type:" + type + ",classID:" + classID + ",classLabel:" + classLabel 
                                + ",timeandplace:" + timeandplace + ",sectionData:" + sectionData.linkage;
            }
        }
        writeCookie("picked-classes", picked_classes);
    } else {
        var cookie = "";
        for (c in class_data) {
            var cd = class_data[c];
            if (class_data[c].sectionID != sectionID) {
                cookie = cookie + "+sectionID:" + cd.sectionID + ",color:" + cd.color
                        + ",type:" + cd.type + ",classID:" + cd.classID + ",classLabel:" + cd.classLabel 
                        + ",timeandplace:" + cd.timeandplace + ",sectionData:" + cd.sectionData;
            } else {
                var color = class_data[c].color;
                releaseColor(color);
            }
        }
        if (color && !classID)
            db.removeStatement(sectionID, "color", color);
        writeCookie("picked-classes", cookie);
    }
}
