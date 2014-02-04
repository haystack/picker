function writeCookie(cookieName, data) {
    var exDate = new Date();
    if (data == '') {
        exDate.setDate(exDate.getDate() - 1); // erase
    } else {
        exDate.setDate(exDate.getDate() + 7); // default expiration in a week
    }
    document.cookie = cookieName+'='+data+'; expires='+exDate+'; path=/';
}

// formerly PersistentData.readCookie
// cookie format: 'picked-classes=1.00; loggedIn=false; picked-sections=L011.00'
function readCookie(cookieName) {
    var start = document.cookie.indexOf(cookieName + '=');
    if (start != -1) {
        start = start + cookieName.length + 1
        var end = document.cookie.indexOf(';', start);
        if (end == -1) {
            end = document.cookie.length;
        }
        var content = unescape(document.cookie.substring(start, end));
        if (content != '') {
            return content;
        }
        return null;
    }
    return null;
}

// formerly updateCookies
function updateStoredDataFromExhibit() {
    var picked_classes = readCookie("picked-classes");
    var saved_data = parseSavedClasses(picked_classes);

    if (window.database.getObject('user', 'userid') != null) {
        for (i in saved_data) {
            var clss = saved_data[i];
    		$.post("scripts/post.php",
    			{ addingClass: true,
                  userid: window.database.getObject('user', 'userid'),
                  sectionID: clss.sectionID,
    			  classID: clss.classID,
                  color: clss.color,
                  type: clss.type,
                  classLabel: clss.classLabel,
                  timeandplace: clss.timeandplace,
                  sectionData: clss.sectionData,
                  userathena: window.database.getObject('user', 'athena'),
                  semester: term + current_year
    			});
        }
    }
    updateMiniTimegrid(false);
}

function deleteClassFromStoredData(sectionID) {
    console.log(sectionID);
    if (window.database.getObject('user', 'userid') != null) {
        $.post("scripts/post.php",
            {   deletingClass: true,
                userid: window.database.getObject('user', 'userid'),
                sectionID: sectionID,
                semester: term + current_year
            });
    }
}

// formerly checkForCookies()
/**function updateExhibitSections(sections) {
    if (!sections) {
        var saved_sections = getStoredSections();
        var picked_classes = readCookie("picked-classes");
        var saved_data = parseSavedClasses(picked_classes);
        var sections = saved_data.map(function (element) { return element.sectionID });
        if (saved_sections) {
            sections = uniqueArray(sections.concat(saved_sections));
        }
    }
    for (i in sections) {
        var sectionID = sections[i];
        if (sectionID.length != 0) {
            window.database.addStatement(sectionID, 'picked', 'true');
            window.database.addStatement(sectionID, 'color', getNewColor());
        }
    }
    updateStoredDataFromExhibit(sections);  
}**/

// formerly PersistentData.stored
function getExhibitSet(category) {
    var exhibitSet;
    var exhibitDb = window.database;

    if (exhibitDb && exhibitDb.getObjects(category, 'list').size() > 0) {
        exhibitSet = exhibitDb.getObjects(category, 'list');
    }
    else {
        elts = readCookie(category);
        if (elts) {elts = elts.split(',')};
        exhibitSet = new Exhibit.Set(elts);
    }
    return exhibitSet;
}

function uniqueArray(array) {
    var a = array.concat();
    for(var i=0; i < a.length; i++) {
        for(var j = i+1; j < a.length; j++) {
            if (a[i] === a[j]) {
                a.splice(j--, 1);
            }
        }
    }
    return a;
}

function uniqueObjArray(array) {
    var a = array.concat();
    for (var i=0; i < a.length; i++) {
        if (a[i] && a[i] != "undefined") {
            for (var j = i+1; j < a.length; j++) {
                if (a[j] && a[j] != "undefined") {
                    if (compareObject(a[i], a[j])) {
                        a.splice(j--, 1);
                    }
                }
            }
        }
    }
    return a;
}

function compareObject(o1, o2){
    for(var p in o1){
        if(o1[p] !== o2[p] && p != "color"){
            return false;
        }
    }
    for(var p in o2){
        if(o1[p] !== o2[p] && p != "color"){
            return false;
        }
    }
    return true;
}
