/**
 * @fileOverview Read and convert JSON feed from data warehouse.
 * @author Quanquan Liu <quanquan@mit.edu>
 */

var classes_by_time = {};

ExhibitImporter = {
 	_type: "processClassData"
 }

/*
registers json importer for processing class data
*/
ExhibitImporter._register = function(evt, reg) {
    if (!reg.isRegistered(
        Exhibit.Importer.JSONP._registryKey,
        ExhibitImporter._type)) {
            reg.register(
                Exhibit.Importer.JSONP._registryKey,
                ExhibitImporter._type,
                ExhibitImporter
            );
       }
};

/*
@json input json for course data from data warehouse
@return processed json for class data
*/
ExhibitImporter.transformJSON = function(json, url, link) {
	var items = json.items;

    for (var i = 0; i < items.length; i++) {
        var item = items[i];

        // If true this is a cross-listed class, and this is not the "master" class
        // Ex. if this class is 18.062, rename it 6.042
        if ('master_subject_id' in item && item.id != item.master_subject_id) {
            // Once both 18.062 and 6.042 are loaded, they will be merged as one class with two courses ["6", "18"]
            items[i] = {"id":item.master_subject_id, "course":item.course, "label":item.label, "type":item.type};
        }
        // Otherwise, this is a regular class -- just load it
        else {
            processOfficialDataItem(item);
        }
    }

    loadStaticData("data/user.php", window.database, setupLogin);

    return json;
}

/*
called by importer to process url 
but does nothing because url does not need to be processed
*/
ExhibitImporter.preprocessURL = function(url) {
    return url;
};

/*
Processes the json into correct format for picker
*/
function processOfficialData(json, individualClasses) {
    var items = json.items;
    // If individualClasses exists, we are here loading only the one class
    // that is the "master class" of a cross-listed class
    if (individualClasses) {
        var classes = [];
        for (var i=0; i < items.length; i++) {
            var item = items[i];
            if (individualClasses.indexOf(item.id) != -1 || individualClasses.indexOf(item['section-of']) != -1) {
                classes.push(item);
            }
        }

        for (var j = 0; j < classes.length; j++) {
            processOfficialDataItem(classes[j]);
        }
        json.items = classes;
    }   
    
    // Otherwise, we are loading all the classes in a course
    else {
        var crossListedClasses = [];
        for (var i = 0; i < items.length; i++) {
            var item = items[i];
            // If true this is a cross-listed class, and this is not the "master" class
            // Ex. if this class is 18.062, rename it 6.042 and load 6.042
            if ('master_subject_id' in item && item.id != item.master_subject_id) {
                var course = item.master_subject_id.split('.')[0];
                if (!isLoaded(course)) {
                    crossListedClasses.push(item.master_subject_id);
                }
                // Once both 18.062 and 6.042 are loaded, they will be merged as one class with two courses ["6", "18"]
                items[i] = {"id":item.master_subject_id, "course":item.course, "label":item.label, "type":item.type};
            }
            // Otherwise, this is a regular class -- just load it
            else {
                processOfficialDataItem(item);
            }
        }
        if (crossListedClasses.length >0) {
            loadIndividualClasses(crossListedClasses);
        }
    }
    return json;
}

/**
 * Makes following changes to JSON
 * before loaded by Exhibit
 **/
function processOfficialDataItem(item) {
    if ('prereqs' in item) { item.prereqs = processPrereqs(item.prereqs); }

    if ('id' in item) {
        item['courseNumber'] = parseNumber(item.master_subject_id);
    }

    for (attribute in item) {
        if (item[attribute] == '') { delete item[attribute]; }
    }

    if (term == 'FA') { item.Instructor = item.fall_instructors; } 
    else { item.Instructor = item.spring_instructors; }

    if ('equivalent_subjects' in item) {
        item.equivalent_subjects = courseArrayToLinks(item.equivalent_subjects);
    }

    if ('timeAndPlace' in item) {
        if (item.timeAndPlace.search(/ARRANGED/) >= 0 || item.timeAndPlace.search(/null/) >= 0) {
            item.timeAndPlace = 'To be arranged';
        }
    }
    if ('units' in item && item.is_variable_units == 'Y') {
        item['units'] = 'Arranged';
        item['total-units'] = 'Arranged';
    }

    if ('offering' in item) {
        item.offering = ((item.offering == 'Y') ? "Currently Offered" : "Not Offered This Term");
    }
    
    if (item.level == "High Graduate") {
	item.level = "Graduate";
    }

    if (item.type == 'LectureSession') {
        item["lecture-section-of"] = item["section-of"];
        processBeginningTime(item.timeAndPlace, item["section-of"]);
        delete item["section-of"]; 
    }
    else if (item.type == 'RecitationSession') {
        item["rec-section-of"] = item["section-of"];
        delete item["section-of"];
    } 
    else if (item.type == 'LabSession') {
        item["lab-section-of"] = item["section-of"];
        delete item["section-of"];
    }
}

// Puts a string of prereqs into correct URL format so can be links
function processPrereqs(prereqs, coords) {
    coords = coords || null;
    if (prereqs == "") {
        prereqs = "--";
    }
    else {
        while (prereqs.search(/GIR:/) >= 0) {
            gir = prereqs.match(/GIR:.{4}/);
            prereqs = prereqs.replace(/GIR:.{4}/, girData[gir].join(" or "));
        }
        while (prereqs.search(/[\]\[]/) >= 0 ) {
            prereqs = prereqs.replace(/[\]\[]/, "");
        }
    }
    // Makes prereqs appear as links
    prereqs = coursesToLinks(prereqs, coords);
    return prereqs;
}

//Parse a list of courses to links
function courseArrayToLinks(array, coords) {
    coords = coords || null;
    string = array.join(',, ');
    string = coursesToLinks(string);
    return string.split(',, ');
}

//makes the link that shows up as a bubble when the prereq link is clicked
function coursesToLinks(courseString, coords) {
    coords = coords || null;
    // Any number of spaces followed by any number of digits
    // followed by, optionally, a letter
    var courseArray = courseString.match(/([^\s\/]+\.[\d]+\w?)/g);
    if (courseArray != null) {
        var string = courseString;
        var output = '';
        var upTo = 0;
        for (var c=0; c<courseArray.length; c++) {
            var course = courseArray[c];
            var index = string.indexOf(course, upTo);
            var replacement = '<a href=\'javascript:{}\' onclick=\'showPrereq(this, "' + course.replace(/J/, '') + '", ' + coords + ');\'>' + course + '</a>';
            // string.substring(upTo, index) is everything not being replaced
            output += string.substring(upTo, index) + replacement;
            upTo = index + course.length;
        }
        courseString = output + string.substring(upTo);
    }
    return courseString;
}

//loads the data from saved classes in a user account
function loadStaticData(link, database, cont) {
    var url = typeof link == "string" ? link : link.href;
    // Given a relative or absolute URL, returns the absolute URL
    url = Exhibit.Persistence.resolveURL(url);

    var fError = function(jqXHR, textStatus, errorThrown) {
        Exhibit.UI.hideBusyIndicator();
        Exhibit.UI.showHelp(Exhibit._("%general.failedToLoadDataFileMessage", link));
        if (cont) cont();
    };
    
    var fSuccess = function(jsonObject, textStatus, jqXHR) {
        Exhibit.UI.hideBusyIndicator();
        try {
            if (jsonObject != null) {
                if (jsonObject.items && jsonObject.items[0] && jsonObject.items[0].type == "Class") {
                    jsonObject = processOfficialData(jsonObject, null);
                }
                database.loadData(jsonObject, Exhibit.Persistence.getBaseURL(url), cont);
            }
        } catch (error) {
            Exhibit.Debug.exception(error, "Error loading Exhibit JSON data from " + url);
        } finally {
            if (cont) cont();
        }
    };

    Exhibit.UI.showBusyIndicator();
    // Calls fSuccess if data is json in correct form, else calls fError
    $.ajax({ url : url,
        error : fError,
        success: fSuccess,
        dataType: 'json' });
}

/*
    Function for processing the classes to fit within time slots
*/
function processBeginningTime(t, section) {
    if (t != null && t != undefined) {
	var beg = t.split("-")[0];
	var half = false;
	var time = "";
    
	if (beg != "To be arranged" && beg.indexOf("SELECTED") === -1) {
	    var days = [];
	    var validDay = /^[a-zA-Z]+$/;
	    if (beg.indexOf(' ') === -1 && beg.indexOf(",") === -1) {
		beg = beg.split(".")[0].split("");
	    } else if (beg.indexOf('EVE') != -1) {
		var parts = beg.split(" ");
		beg = (parts[0] + (parseInt(parts[2].split("(")[1]) + 12) + "").split("");
	    } else {
		if (beg.indexOf(",") === -1)
		    beg = beg.split(" ")[0].split("");
		else {
		    beg = beg.split(" ")[0].split(",");
		    for (item in beg) 
			processBeginningTime(beg[item], section);
		    beg = [];
		}
	    }
	    for (c in beg) {
		if (beg[c].match(validDay)) {
		    days.push(beg[c]);
		} else {
		    if (!half) {
			time = time + beg[c];
			if (beg[c] == ".")
			    half = true;
		    }
		}
	    }
	    if (parseInt(time) < 8) {
		time = parseInt(time) + 12;
	    }
	    for (d in days) {
		if (classes_by_time[days[d]+time] == null) 
		    classes_by_time[days[d]+time] = [];
		classes_by_time[days[d]+time].push(section);
	    }
	}
    }
}

//Turns a class name with a letter into just a number so it can be sorted by exhibit
function parseNumber(num) {
    numNoLetters = "";
    counter = 0;
    for (l in num) {
        if (!num.charAt(l).match("[a-zA-Z]+")) {
            numNoLetters += num.charAt(l);
        } else {
            counter = 100;
        }
    }
    if (numNoLetters != ".") 
        return parseFloat(numNoLetters) + counter;
    else 
        return counter;
}

/*
    Pass in listener for calendar cells
*/
function showClassesDuringTime(obj) {
    logData["looked at classes during time", $(obj[0]).attr("classid")];
	
    var classes = classes_by_time[$(obj[0]).attr("classid")];
    var backgroundc = $($(".timegrid-hline").find("[classid='" + $(obj[0]).attr("classid") + "']")).css("background-color");
    if ( backgroundc == "rgb(0, 0, 128)" || backgroundc == "#000080" ) {
	$("#timed-classes-list").empty();
	$("#right-time-wrapper-list").empty();
	$($(".timegrid-hline").find("[classid='" + $(obj[0]).attr("classid") + "']")).css("background-color", "#FFFFFF");
	return null;
    }
    
    $(".timegrid-vline").css("background-color", "#FFFFFF");
    $($(".timegrid-hline").find("[classid='" + $(obj[0]).attr("classid") + "']")).css("background-color", "#000080");
    
    if ($("#schedule-details-layer").css("visibility") != "visible") {
        $("#timed-classes-list").empty();
        $("#timed-classes-list").append("<h1>Showing classes occuring on " + parseDayAndTime($(obj[0]).attr("classid")) + ":</h1><br>");
        $("#timed-classes-list").append("<table></table>");
        var numClasses = classes.length;
        var classesPerColumn = Math.ceil(numClasses/3);
        var counter = 0;
        for (var i = 0; i < 3; i++) {
            $("#timed-classes-list table").append("<td width='35%'></td>");
            counter = 0;
            while (counter < classesPerColumn && (i * classesPerColumn + counter) < numClasses) {
                $($("#timed-classes-list table td")[i]).append("<a href='javascript:{}' onclick='showClickedClassDetails(" + "&quot;" + classes[i * classesPerColumn + counter] + "&quot;" + ");'>"+ classes[i * classesPerColumn + counter] + "</a><br>");
                counter++;
            }
        } 
    } else {
	$("#right-time-wrapper-list").empty();
        $("#right-time-wrapper-list").append("<br><br><h1>Showing classes occuring on " + parseDayAndTime($(obj[0]).attr("classid")) + ":</h1>");
        for (i in classes) {
            if (window.database.getObject(classes[i], "label") != null) 
                $("#right-time-wrapper-list").append("<br>" + processPrereqs(classes[i], true) + " " + window.database.getObject(classes[i], "label") + "<br>");
        }
    }
}

/*
Parses the day and time from calendar to words
*/
function parseDayAndTime(dayAndTime) {
    var elts = dayAndTime.split("");

    var days = {
        "M": "Monday",
        "T": "Tuesday",
        "W": "Wednesday",
        "R": "Thursday",
        "F": "Friday",
        "S": "Saturday/Sunday"
    }

    var times = {
        "8": "8 am",
        "9": "9 am",
        "10": "10 am",
        "11": "11 am",
        "12": "12 pm",
        "13": "1 pm",
        "14": "2 pm",
        "15": "3 pm",
        "16": "4 pm",
        "17": "5 pm",
        "18": "6 pm",
        "19": "7 pm",
        "20": "8 pm",
        "21": "9 pm"
    }

    return days[elts[0]] + ", " + times[dayAndTime.slice(1, dayAndTime.length)]
} 

/* 
registers importer using jquery
*/
$(document).one(
    "registerJSONPImporters.exhibit",
    ExhibitImporter._register
);
