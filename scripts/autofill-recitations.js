function autofill() {
    var classes = readCookie("picked-classes");
    classes = parseSavedClasses(classes);
    classes = uniqueObjArray(classes);
    console.log(classes[0]);
    
    var classlist = $.map( classes, function(val, i) {
        return val.sectionID;
    });
    
    var timeblocks = {}
    for (var i = 8; i < 22; i++) {
        timeblocks[i] = false;
    }
    
    for (var i = 0; i < classes.length; i++) {
        console.log(processTime(classes[i].timeandplace));
    }
    
    var recitations = [];
    var labs = [];
    
    for (var c in classes) {
        if (window.database.getSubjects(classes[c] , "rec-section-of").toArray().length > 0) {
            recitations.push(window.database.getSubjects(classes[c] , "rec-section-of").toArray());   
        }
        if (window.database.getSubjects(classes[c], "lab-section-of").toArray().length > 0) {
            labs.push(window.database.getSubjects(classes[c], "lab-section-of").toArray());   
        }
    }
    
            
    if (recitations.length > 0) {
        if (labs.length > 0) {
            recitations = recitations + labs;
        }
        
        recitations.sort(function (a, b) {
          return a.length - b.length;
        });
    }
}