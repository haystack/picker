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

    var sections = [];
    var classes = [];
    console.log(saved_data);
    for (i in saved_data) {
        var clss = saved_data[i];
        sections.push(clss.sectionID);
        classes.push(clss.classID);
    }

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
    var sections = getExhibitSet('picked-sections');
    var mysqlSections = new Exhibit.Set(getStoredSections());
    sections.addSet(mysqlSections);
    
    sections.visit( function(sectionID) {
            if (window.database.containsItem(sectionID) && sectionID.length != 0) {
                window.database.addStatement(sectionID, 'picked', 'true');
                window.database.addStatement(sectionID, 'color', getNewColor());

                var classID = window.database.getItem(sectionIDtoClass(sectionID))["id"];
                var data = {items: [ {"label":classID, "selected":"yes"}]};
                window.database.loadData(data);
            }
        });

    window.exhibit.getCollection('picked-sections')._update();
    
    updateStoredDataFromExhibit();  
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
