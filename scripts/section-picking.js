/* Formerly part of browse.js ; look there for svn history */

function onPickUnpick(button) {
    // Check to see whether the class is currently picked by user
    var sectionID = button.getAttribute("sectionID");
    var picked = window.database.getObject(sectionID, "picked") == "true";
    // if the class is already picked, unpick it
    if (picked) {
	   doUnpick(sectionID);
    // Otherwise, pick it
    } else {
	   doPick(sectionID);
    }
    updatePickedClassesList();
    updateStoredDataFromExhibit();
};

function onUnpick(button) {
    var sectionID = button.getAttribute("sectionID");
    doUnpick(sectionID);
    updatePickedClassesList();
};

function sectionIDtoClass(sectionID) {
    var db = window.database;
    var type = db.getObject(sectionID, "type");
    var classID = db.getObject(sectionID, sectionTypeToData[type].linkage);
    return classID;
}

// Does the actual picking of a class
function doPick(sectionID) {
    var db = window.exhibit.getDatabase();
    updateCookie(sectionID, true);
    //writeCookie("testing", "again with the testing values");

    window.database.addStatement(sectionID, "picked", "true");
    window.database.removeStatement(sectionID, "temppick", "true");

    showHidePickDiv(sectionID, true);

    var classID = sectionIDtoClass(sectionID)
    //var data = {items: [ {"label":classID, "selected":"yes"}]};
    //window.database.loadData(data);
    window.database.addStatement(classID, "selected", "yes");
    updateMiniTimegrid(false);
}

function doUnpick(sectionID) {
    window.database.removeStatement(sectionID, "picked", "true");
    updateCookie(sectionID, false);
    
    showHidePickDiv(sectionID, false);
    window.database.removeStatement(sectionIDtoClass(sectionID), "selected", "yes");
    updateMiniTimegrid(false);
}

function onMouseOverSection(div) {
    var sectionID = div.getAttribute("sectionID");
    if (window.database.getObject(sectionID, "picked") == null) {
        updateMiniTimegrid(true, sectionID);
    }
}

function onMouseOutSection(div) {
    var sectionID = div.getAttribute("sectionID");
    if (window.database.getObject(sectionID, "picked") == null) {
        updateMiniTimegrid(true, null);
    }
}

function showHidePickDiv(sectionID, picked) {
    var thediv = document.getElementById("divid-" + sectionID);
    if (thediv != null) {
        thediv.className = picked ? "each-section-picked" : "each-section-unpicked";
        
        var button = thediv.getElementsByTagName("button")[0];
        button.innerHTML = picked ? "Remove" : "Add";
    }
}

function collapseShowAll() {
    collapse = howManyCollapsed();
    
    $(".link-show").each(function(index) {
        toggleBody(this, collapse); });
    
    howManyCollapsed();
}

function howManyCollapsed(){
    var thediv = document.getElementById("classes-layer");
    var numShown = 0;
    var collapse = false;
    
    $(".link-show").each(function(index) {
        if(countCollapsed(this)) {
            numShown ++; }});
    
    if (numShown > 0) {
        collapse = false;
    } else {
        collapse = true; }
        
    var button = thediv.getElementsByTagName("button")[0];
    button.innerHTML = collapse ? "Show" : "Collapse";
    
    return collapse
}

function countCollapsed(a) {
    var div=$(a.parentNode).siblings("div")[0];
    if (div.style.display == "block") {
	return true;
    } else {
	return false;
    }
}

function toggleBody(a, collapse) {
    var div=$(a.parentNode).siblings("div")[0];
    if (collapse) {
	div.style.display = "block";
    } else {
	div.style.display = "none";
    }
    howManyCollapsed();
}

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
                 }
                class_data.push(saved);
            }
        }
    }
    return class_data;
}

function updateCookie(sectionID, add, classID, classLabel, timeAndPlace, type, sectionData) {
    console.log(classID);
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