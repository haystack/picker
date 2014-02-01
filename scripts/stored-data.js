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
function updateStoredDataFromExhibit(sections) {
    var classes = uniqueArray(sections.map(function (element) { return sectionIDtoClass(element) }));

    if (window.database.getObject('user', 'userid') != null) {
		$.post("scripts/post.php",
			{ userid: window.database.getObject('user', 'userid'),
			  pickedsections: sections.join(','),
			  pickedclasses: classes.join(',')
			});
    }
}

// formerly checkForCookies()
function updateExhibitSections() {
    var saved_sections = getStoredSections();
    var picked_classes = readCookie("picked-classes");
    var saved_data = parseSavedClasses(picked_classes);
    var sections = saved_data.map(function (element) { return element.sectionID });
    if (saved_sections) {
        sections = uniqueArray(sections.concat(saved_sections));
    }

    for (i in sections) {
        var sectionID = sections[i];
        if (window.database.containsItem(sectionID) && sectionID.length != 0) {
            window.database.addStatement(sectionID, 'picked', 'true');
            window.database.addStatement(sectionID, 'color', getNewColor());
        }
    }
    
    updateStoredDataFromExhibit(sections);  
}

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
            if (a[i] === a[j])
                a.splice(j--, 1);
        }
    }
    return a;
};
