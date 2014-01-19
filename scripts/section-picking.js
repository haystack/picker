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
};

function onUnpick(button) {
    var sectionID = button.getAttribute("sectionID");
    SimileAjax.History.addLengthyAction(
        function() { doUnpick(sectionID) },
        function() { doPick(sectionID) },
        "Unpicked " + sectionID
    );
};

function sectionIDtoClass(sectionID) {
    var db = window.exhibit.getDatabase();
    var type = db.getObject(sectionID, "type");
    var classID = db.getObject(sectionID, sectionTypeToData[type].linkage);
    return classID;
}

// Does the actual picking of a class
function doPick(sectionID) {
    var picked_classes = readCookie("picked-classes");
    if (picked_classes != null) {
        picked_classes = picked_classes + "+sectionID:" + sectionID + ",color:" + getNewColor();
    } else {
        picked_classes = "+sectionID:" + sectionID + ",color:" + getNewColor();
    }
    writeCookie("picked-classes", picked_classes);

    window.database.addStatement(sectionID, "picked", "true");

    showHidePickDiv(sectionID, true);
    var classID = sectionIDtoClass(sectionID)
    var data = {items: [ {"label":classID, "selected":"yes"}]};
    window.database.loadData(data);
    //doUnpick("L011.00");
}

function doUnpick(sectionID) {
    var picked_classes = readCookie("picked-classes");
    var class_data = parseSavedClasses(picked_classes);
    console.log(class_data);
    window.database.removeStatement(sectionID, "picked", "true");
    var cookie = "";
    for (c in class_data) {
        if (class_data[c].sectionID != sectionID) {
            console.log(class_data[c].sectionID);
            console.log(class_data[c]);
            cookie = cookie + "+sectionID" + class_data[c].sectionID + ",color:" + class_data[c].color;
        } else {
            releaseColor(class_data[c].color);
        }
    }
    writeCookie("picked-classes", cookie);
    
    showHidePickDiv(sectionID, false);
    window.database.removeStatement(sectionIDtoClass(sectionID), "selected", "yes");
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
    var picked_classes = classes.split("+");
    var class_data = []
    for (c in picked_classes) {
        if (c != 0) {
            var data = picked_classes[c].split(",");
            var saved = new Object();
            for (i in data) {
                var attr = data[i].split(":")[0];
                if (attr == "sectionID") 
                    saved.sectionID = data[i].split(":")[1];
                else
                    saved.color = data[i].split(":")[1];
            }
            class_data.push(saved);
        }
    }
    return class_data;
}