/**
 * Fill will uphold all functions related to autofilling recitations
 * on Course Picker Alpha
 * 
 */

/**
 * Finds all the classes that has been picked.
 * If a class already has a recitation picked, skip this
 * class when autopicking recitations.
 *
 * @param The current exhibit database.
 * @param List of picked classes.
 * @returns List of classes that still need recitations to be picked.
 * 
 */
var parsePickedClasses = function(pickedClasses, database) {
    var needRec = {};
    var hasRec = {};
    var recs = [];
    
    for (var pickedClass in pickedClasses) {
        var classNum = getClassNumber(pickedClass, database);
        var type = getSessionType(pickedClass, database);
        if(type == "Lecture") {
            if (!(classNum in hasRec)) {
                needRec[classNum] = true;
            }
        }
        else {
            if(classNum in needRec) {
                delete needRec[classNum];   
            }
            if(!(classNum in hasRec)) {
                hasRec[classNum] = true;
            }
        }
    }
    for (c in needRec) {
        recs.push(c);
    }
    for (cl in recs) {
        doUnpick(cl);
    }
    return recs;
}

