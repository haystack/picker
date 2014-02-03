/**
 * @description Javascript code for loading the mini Timegrid displaying
 *   picked classes
 */

/**
 * A type of EventSource that allows the creation and display of recurring 
 * events that are not tied to a specific date, e.g. 8am on MWF.
 */
var miniEventSource = new Timegrid.RecurringEventSource();
var timegridEventSource = new Timegrid.RecurringEventSource();
var events = [];

var dayMap = {'M' : 1, 'T' : 2, 'W' : 3, 'R' : 4, 'F' : 5 };

function updateMiniTimegrid(preview, previewSectionID) {
    events = [];

    var addPreviewSection = function(sectionID) {
        var db = window.exhibit.getDatabase();

        // example: type = "LectureSession"
        var type = db.getObject(sectionID, "type");

        var sectionData = sectionTypeToData[type];
        // example: 7.012 = db.getObject(L017.012, "lecture-session-of");
        var classID = db.getObject(sectionID, sectionData.linkage);
        var classLabel = db.getObject(classID, "label");
        var color = db.getObject(sectionID, "color");

        // Definition of visit(function) given in Exhibit documentation
        //"Exhibit.Set.prototype.visit=function(A){for(var B in this._hash){if(A(B)==true){break;}"
        //api/exhibit-bundle.js line 8235 
        var timeAndPlace = db.getObject(sectionID, "timeAndPlace")
        processTimeAndPlace(sectionID, color, type, classID, classLabel, timeAndPlace, sectionData);
    };

    addPickedClasses();
    if (preview) {
        if (previewSectionID) {
            addPreviewSection(previewSectionID);
        }
        miniEventSource.setEventPrototypes(events);
    } else {
        miniEventSource.setEventPrototypes(events);
        timegridEventSource.setEventPrototypes(events);
    }

    if (Timegrid.listener) {
        $(".timegrid-vline").each(function(i, obj) {
            $(this).bind("click", function() {Timegrid.listener($(this))});
        });
    }
};

function processTime(time, eve) {
    var startEnd = time.split("-");
    for (var x = 0; x < startEnd.length; x++) {
	    if (startEnd[x].search(/\./) > 0) { 
		    var hourMinutes = startEnd[x].split('.');
            // a time like 1 is in the afternoon and notated 13
		    if (hourMinutes[0] < 6 || eve) { 
			    hourMinutes[0] = parseInt(hourMinutes[0]) + 12;
		    } 
              startEnd[x] = hourMinutes.join(':');
	    } else {
		    if (startEnd[x] < 6 || eve) { 
                startEnd[x] = parseInt(startEnd[x]) + 12; 
            }
		    startEnd[x] = startEnd[x] + ":00";
	    }
    }
    return startEnd;
}

function enableMiniTimegrid() {
    updateMiniTimegrid();
    
    window.timegrids = [
        Timegrid.createFromDOM($('#mini-timegrid').get(0)),
        Timegrid.createFromDOM($('#timegrid').get(0))
    ];
    
    window.onresize = function() { Timegrid.resize(); };
};

function addPickedClasses() {
    var picked_classes = readCookie("picked-classes");
    var collection = parseSavedClasses(picked_classes);

    for (c in collection) {
        if (collection[c]) {
            var sectionID = collection[c].sectionID;
            var color = collection[c].color;
            var type = collection[c].type;
            var classID = collection[c].classID;
            var classLabel = collection[c].classLabel;
            var timeandplace = collection[c].timeandplace;
            var sectionData = collection[c].sectionData;
            processTimeAndPlace(sectionID, color, type, classID, classLabel, timeandplace, sectionData);
        }
    }
}

function processTimeAndPlace (sectionID, color, type, classID, classLabel, timeAndPlace, sectionData) { 
    if (timeAndPlace.search(/arranged/) < 0) {
        var timePlaceArray = timeAndPlace.split(" ");
        var sessions = [];
        // deals with EVE classes but ignores location changes
        // EVE format: "W EVE (5-8.30 PM) 56-202" 
        if (timePlaceArray.length > 4 && timePlaceArray[1] == 'EVE') {
            var days = timePlaceArray[0];
            var time = timePlaceArray[2].replace('(', '');
            var startEnd = processTime(time, true);
            var room = timePlaceArray.length > 4 ? (" @ " + timePlaceArray[timePlaceArray.length - 1]) : "";
            sessions = [{'days':days, 'time':time, 'startEnd':startEnd, 'room':room}];
        } 
        else {
            // non-EVE format: "MWF9-10.30 56-114"
            // or perhaps: "MWF9-10.30,TR11-2 56-114"
            var timeAndDay = timePlaceArray[0].split(",");
            for (var t = 0; t < timeAndDay.length; t++) {
                var days = timeAndDay[t].substring(0, timeAndDay[t].search(/\d/));
                var time = timeAndDay[t].substr(timeAndDay[t].search(/\d/));
                var startEnd = processTime(time, false);
                var room = timePlaceArray.length > 1 ? (" @ " + timePlaceArray[timePlaceArray.length - 1]) : "";
                sessions.push({'days':days, 'time':time, 'startEnd':startEnd, 'room':room});
            }
        }
        for (var j=0; j<sessions.length; j++) {                               
            var start = Date.parseString(sessions[j].startEnd[0], 'H:mm');
            var end = sessions[j].startEnd.length > 1 ? Date.parseString(sessions[j].startEnd[1], 'H:mm') : start.clone().add('h', 1);
            for (var d = 0; d < sessions[j].days.length ; d++) {
                addEvent(classLabel + room + " " + sectionData.postfix, sessions[j].days.substr(d,1), start, end, color);
            }
        }
    }
}

function addEvent(label, dayLetter, start, end, color) {
    var day   = dayMap[dayLetter];
    var event = new Timegrid.RecurringEventSource.EventPrototype(
        [ day ], 
        start, 
        end, 
        label, 
        "", 
        "", 
        "", 
        "", 
        color, 
        "white"
    );
    events.push(event);
}
