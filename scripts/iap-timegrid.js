/**
 * @description Javascript code for loading the IAP Timegrid displaying
 *   picked classes
 */

var days = [];
function resetDays() {
    days = [];
    for (var i = 0; i < 31 + 7; i++) { // go into February, too
        days.push({ timeSpans: [], lectures: [], conflict: false, preview: false });
    }
}

function updateIAPTimegrid(preview, previewSectionID) {
    var db = window.exhibit.getDatabase();
    var collection = window.exhibit.getCollection("picked-sections");
    var itemSet = collection.getRestrictedItems();
    
    resetDays();
    
    var addLecture = function(lecID, preview) {
        var start = db.getObject(lecID, "start");
        var end = db.getObject(lecID, "end");
        
        var startTime = SimileAjax.DateTime.parseIso8601DateTime(start + ":00");
        if (startTime == null) {
            return;
        }
        
        var endTime = null;
        try {
            endTime = SimileAjax.DateTime.parseIso8601DateTime(end + ":00");
        } catch (e) {}
        if (endTime == null) {
            endTime = new Date(startTime.getTime() + 60 * 60 * 1000);
        }
        
        var startMinute = startTime.getHours() * 60 + startTime.getMinutes();
        var endMinute = endTime.getHours() * 60 + endTime.getMinutes();
        
        var dayOfMonth = (startTime.getMonth() * 31) + startTime.getDate(); // go into February, too
        var day = days[dayOfMonth - 1];
        if (preview) {
            day.preview = true;
        } else {
            day.lectures.push(lecID);
        }
        if (!day.conflict) {
            for (var i = 0; i < day.timeSpans.length; i++) {
                var timeSpan = day.timeSpans[i];
                if (!(endMinute < timeSpan.start || startMinute >= timeSpan.end)) {
                    day.conflict = true;
                    break;
                }
            }
            day.timeSpans.push({ start: startMinute, end: endMinute });
        }
    };
    
    var addSection = function(sectionID, preview) {
        var classID = db.getObject(sectionID, "class");
        db.getSubjects(sectionID, "section").visit(function (lecID) { addLecture(lecID, preview); });
    };
    
    itemSet.visit(addSection);
    if (preview) {
        if (previewSectionID) {
            addSection(previewSectionID, true);
        }
    }
    
    for (var i = 0; i < days.length; i++) {
        var day = days[i];
        var td = document.getElementById("day-" + i);
        if (td == null) {
            continue;
        }
        
        var preview = day.preview ? "preview-" : "";
        var classes = ["calendar-cell"];
        
        if (day.conflict) {
            classes.push(preview + "conflict-day");
        } else if (day.lectures.length > 0) {
            classes.push(preview + "busy-day");
        } else {
            classes.push(preview + "free-day");
        }
        
        td.className = classes.join(" ");
    }
};

function constructCalendar() {
    var table = document.getElementById("calendar");
    
    var makeDay = function(td, d) {
        if (d < 0) {
            td.className = "calendar-cell";
        } else {
            td.id = "day-" + d;
            td.className = "calendar-cell free-day";
            td.innerHTML = new String((d % 31) + 1);
        }
        td.onmouseover = function(evt) {
            evt = (evt) ? evt : event;
            onCalendarDayHover(evt, td, d);
        }
    };
    
    var dayOfMonth = -new Date(2008, 0, 1).getDay(); // 0 is Sunday
    while (dayOfMonth < 31) {
        var tr = table.insertRow(table.rows.length);
        for (var c = 0; c < 7; c++) {
            var td = tr.insertCell(c);
            makeDay(td, dayOfMonth);
            dayOfMonth++;
        }
    }
}

function onCalendarDayHover(evt, td, d) {
    var day = days[d];
    if (day.lectures.length > 0) {
        var db = window.exhibit.getDatabase();
        var data = [];
        for (var i = 0; i < day.lectures.length; i++) {
            var lecID = day.lectures[i];
            var start = db.getObject(lecID, "start");
            var end = db.getObject(lecID, "end");
            
            var startTime = SimileAjax.DateTime.parseIso8601DateTime(start + ":00");
            if (startTime == null) {
                return;
            }
            
            var endTime = null;
            try {
                endTime = SimileAjax.DateTime.parseIso8601DateTime(end + ":00");
            } catch (e) {}
            if (endTime == null) {
                endTime = new Date(startTime.getTime() + 60 * 60 * 1000);
            }
            
            var sectionID = db.getObject(lecID, "section");
            var classID = db.getObject(sectionID, "class");
            var label = db.getObject(classID, "label");
            
            data.push({ start: startTime, end: endTime, description: label });
        }
        
        data.sort(function(a, b) {
            var c = a.start.getTime() - b.start.getTime();
            if (c == 0) {
                c = a.end.getTime() - b.end.getTime();
            }
            if (c == 0) {
                c = a.description.localeCompare(b.description);
            }
            return c;
        });
        
        var pad = function(n) {
            return n >= 10 ? n : ("0" + n);
        }
        var formatTime = function(t) {
            return t.getHours() + ":" + pad(t.getMinutes());
        }
        
        var table = document.createElement("table");
        table.cellPadding = "3";
        for (var i = 0; i < data.length; i++) {
            var datum = data[i];
            var tr = table.insertRow(i);
            var td0 = tr.insertCell(0);
            var td1 = tr.insertCell(1);
            
            td0.innerHTML = formatTime(datum.start) + "&mdash;" + formatTime(datum.end);
            td1.innerHTML = datum.description;
            td1.style.fontWeight = "bold";
            if (i > 0) {
                td1.style.borderTop = "1px solid #aaa";
            }
        }
        
        var coords = SimileAjax.DOM.getEventPageCoordinates(evt);
        
        var balloon = document.getElementById("balloon");
        if (balloon != null) {
            balloon.innerHTML = "";
        } else {
            balloon = document.createElement("div");
            balloon.id = "balloon";
            document.body.appendChild(balloon);
        }
        balloon.appendChild(table);
        balloon.style.left = (coords.x - 300 - 50) + "px";
        balloon.style.top = (coords.y + 20) + "px";
        balloon.style.display = "block";
    } else {
        onCalendarMouseOut();
    }
}

function onCalendarMouseOut() {
    var balloon = document.getElementById("balloon");
    if (balloon != null) {
        balloon.style.display = "none";
    }
}

function enableIAPTimegrid() {
    constructCalendar();
    resetDays();
    
    var collection = window.exhibit.getCollection("picked-sections");
    collection.addListener({ onItemsChanged: function() { updateIAPTimegrid(false); } });
};

function showDetailedSchedule() {
    var db = window.exhibit.getDatabase();
    var collection = window.exhibit.getCollection("picked-sections");
    var itemSet = collection.getRestrictedItems();
    if (itemSet.size() == 0) {
        alert("There's nothing on your schedule. Add some classes first!");
    } else {
        window.open("iap-calendar.html?sections=" + itemSet.toArray().join(";"), "picker-calendar");
    }
};
