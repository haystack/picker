/*
 * unit-adder.js
 */

function toggleUnitAdder() {
    var collection = readCookie("picked-classes");
    var classes = parseSavedClasses(collection);
    classes = uniqueObjArray(classes);
    
    var div = $('#total-units');
    div.empty();
    
    var pickedClasses = [];
    
    if (classes.length > 0) {
	var units = { lecture: 0, lab: 0, prep: 0, total: 0, string: "", arranged: ""};
	for (var i = 0; i < classes.length; i++) {
	    var classID = classes[i].classID;
	    if (pickedClasses.indexOf(classID) < 0) {
		addUnits(classID, units);
		pickedClasses.push(classID);
	    }
	}
	units.string = units.lecture + "-" + units.lab + "-" + units.prep;
    
	if (units.lecture + units.lab + units.prep > 0) {
		div.append('<span class="picker-ratings">Total Units: '+units.total + ' ('+ units.string + units.arranged + ')</span><br>');
	} else {
		div.append('<span class="picker-ratings">Total Units: '+units.total + units.arranged + '</span>');	
	}
    }
}

function addUnits(classID, units, reported) {
    // units given as "3-2-7" or "Arranged"
    var unitArray = window.database.getObject(classID, "units").split('-');
    if (unitArray.length == 1) {
        units.arranged = " + Arranged";
    }
    else if (unitArray.length == 3) {
	units.lecture += parseInt(unitArray[0]);
	units.lab += parseInt(unitArray[1]);
	units.prep += parseInt(unitArray[2]);
        units.total += parseInt(database.getObject(classID, "total-units"));
    }
}