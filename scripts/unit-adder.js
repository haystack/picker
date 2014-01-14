/*
 * unit-adder.js
 */

function toggleUnitAdder() {
    var collection = window.exhibit.getCollection("picked-classes");
	var classes = collection.getRestrictedItems();
    var div = document.getElementById('total-units');
	if (classes.size() > 0) {
		var units = { lecture: 0, lab: 0, prep: 0, total: 0, string: "", arranged: ""};
		var reported = { hours: 0, courses: 0 };
        for (var classID in classes._hash) {
            addUnits(classID, units, reported);
        }
		
		units.string = units.lecture + "-" + units.lab + "-" + units.prep;
		if (reported.courses == 1) { var courseWord = ' Course'; } else { var courseWord = ' Courses'; }

		if (units.lecture + units.lab + units.prep > 0) {
			div.innerHTML = 'Total Units: '+units.string + units.arranged+' ('+units.total+')'+
							'<br>Reported Hours: '+reported.hours+' ('+ reported.courses+courseWord+')<br>';
		} else {
			div.innerHTML = 'Total Units: '+units.total + units.arranged;	
		}
	   document.getElementById('no-picked-classes').style.display = "none";
	} else {
		div.innerHTML = "";
	    document.getElementById('no-picked-classes').style.display = "block";
	}
} 

function enableUnitAdderListener() {
 	var collection = window.exhibit.getCollection("picked-classes");
 	collection.addListener({ onItemsChanged: toggleUnitAdder});
}

function addUnits(classID, units, reported) {
    // units given as "3-2-7" or "Arranged"
    var unitArray = database.getObject(classID, "units").split('-');
    if (unitArray.length == 1) {
        units.arranged = " + Arranged";
    }
    else if (unitArray.length == 3) {
	    units.lecture += parseInt(unitArray[0]);
	    units.lab += parseInt(unitArray[1]);
	    units.prep += parseInt(unitArray[2]);
        units.total += parseInt(database.getObject(classID, "total-units"));
    }
    var classRating = database.getSubject(classID, "class-rating-of");
    if (classRating != null) {
	    var hours = database.getObject(classRating, "hours");
	    if (hours !== null) {
		    reported.hours += (Math.ceil(10 * parseFloat(hours)) / 10);
       		reported.courses++;
       	}
    }
}
 
