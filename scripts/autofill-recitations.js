/*
 @fileOverview Function for determining automatic
 recitation section assignments
 @author Quanquan Liu <quanquan@mit.edu>
 */

function auto() {
    Exhibit.UI.showBusyIndicator();
    Exhibit.UI.busyMessage('Getting recitation times');
    setTimeout(function () {
        autofill();
    }, 1000);
}

function autofill() {
    var classes = readCookie("picked-classes");
    classes = parseSavedClasses(classes);
    classes = uniqueObjArray(classes);
    
    var recitations = [];
    var labs = [];
    var stack = [];
    
    var timeblocks = {};
    
    var addToTimeblocks = function(dayTime) {
        var days = dayTime[0].split("");
        var startEnd = dayTime[1];
        for (var k = 0;  k < days.length; k++) {
            if (startEnd.length > 1) {
                var beg = parseInt(startEnd[0].split(":")[0]);
                var end = parseInt(startEnd[1].split(":")[0]);
                for (var j = beg; j < end + 1; j++) {
                    timeblocks[days[k] + j] = true;
                }
            } else {
                timeblocks[days[k]+startEnd[0].split(":")[0]] = true;
            }
        }
    }
    
    var removeFromTimeblocks = function(dayTime) {
        var days = dayTime[0].split("");
        var startEnd = dayTime[1];
        for (var k = 0;  k < days.length; k++) {
            if (startEnd.length > 1) {
                var beg = parseInt(startEnd[0].split(":")[0]);
                var end = parseInt(startEnd[1].split(":")[0]);
                for (var j = beg; j < end + 1; j++) {
                    timeblocks[days[k] + j] = false;
                }
            } else {
                timeblocks[days[k]+startEnd[0].split(":")[0]] = false;
            }
        }
    }
        
    var processPicks = function(stack) {
        for (var i = 0; i < stack.length; i++) {
            doPick(stack[i][0][0]);
            updateMiniTimegrid(false);
            updatePickedClassesList();
            editMiniTimegridTitles();
            
            Exhibit.UI.hideBusyIndicator();
        }
    }
    
    var depthFirst = function(lastIndex) {
        checkNextRecitation(recitations[lastIndex][0], 0);
        if (stack.length === recitations.length) {
            processPicks(stack);
        } else {
            depthFirst(stack.length);
        }
    }
    
    var checkNextRecitation = function(recitation, index) {
        var timeandplace = window.database.getObject(recitation, "timeAndPlace").split(" ");
        var dayTime = processBegEndTime(timeandplace);
        var days = dayTime[0].split("");
        var startEnd = dayTime[1];
        
        var taken = false;
        
        for (var k = 0;  k < days.length; k++) {
            if (startEnd.length > 1 && !taken) {
                var beg = parseInt(startEnd[0].split(":")[0]);
                var end = parseInt(startEnd[1].split(":")[0]);
                for (var j = beg; j < end + 1; j++) {
                    if (timeblocks[days[k] + j]) {
                        taken = true;
                        break;
                    }
                }
            } else if (timeblocks[days[k]+startEnd[0].split(":")[0]] && !taken) {
                taken = true;
                break;
            }
        }
        
        if (!taken) {
            stack.push([[recitation, dayTime], index]);
            addToTimeblocks(dayTime);
            if (stack.length < recitations.length) {
                depthFirst(stack.length);   
            }
        } else {
            if (index + 1 < recitations[stack.length].length) {
                checkNextRecitation(recitations[stack.length][index + 1], index + 1);
            } else {
                if (stack.length - 1 < 0 || stack[stack.length-1][1] === recitations[stack.length - 1].length - 1) {
                    stack.push([[recitation, dayTime], index]);
                    addToTimeblocks(dayTime);
                } else {
                    var lastRec = stack.pop();
                    var ind = lastRec[1];
                    if (lastRec != null) {
                        removeFromTimeblocks(lastRec[0][1]);   
                    }
                    checkNextRecitation(recitations[stack.length][ind + 1], ind + 1);
                }
            }
        }
    }
    
    var classlist = $.map( classes, function(val, i) {
        return val.sectionID;
    });
    
    for (var i = 0; i < classes.length; i++) {
        var timePlaceArray = classes[i].timeandplace.split(" ");
        var dayTime = processBegEndTime(timePlaceArray);
        
        addToTimeblocks(dayTime);
    }

    for (var c in classes) {
        if (window.database.getSubjects(classes[c].classID, "rec-section-of").toArray().length > 0) {
            var present = false;
            var temp = window.database.getSubjects(classes[c].classID , "rec-section-of").toArray();
            for (var i = 0; i < temp.length; i++) {
                if (classlist.indexOf(temp[i]) > -1) {
                    present = true;
                    break;
                }
            }
            if (!present && recitations.indexOf(temp) === -1) {
                temp = temp.filter(function (item) {
                    var time = window.database.getObject(item, "timeAndPlace");
                    if (time.indexOf("arranged") > -1 ) {
                        return false;
                    }
                    return true;
                });
                if (temp.length > 0) {
                    recitations.push(temp);   
                }
            }
        }
        if (window.database.getSubjects(classes[c], "lab-section-of").toArray().length > 0) {
            var present = false;
            var temp = window.database.getSubjects(classes[c].classID, "lab-section-of").toArray();
            for (var i = 0; i < temp.length; i++) {
                if (classlist.indexOf(temp[i]) > -1) {
                    present = true;
                    break;
                }
            }
            if (!present && recitations.indexOf(temp) === -1) {
                labs.push(temp);   
            }   
        }
    }
                
    if (recitations.length > 0) {
        if (labs.length > 0) {
            recitations = recitations + labs;
        }
        
        recitations.sort(function (a, b) {
          return a.length - b.length;
        });
        
        while (stack.length < recitations.length) {
            depthFirst(stack.length);
        }
    }
    
    Exhibit.UI.hideBusyIndicator();
    stack = $.map( stack, function( val, i ) { return val[0][0]; });
    logData(["used autofill recitations"].concat(stack));
}

function processBegEndTime(timePlaceArray) {
    if (timePlaceArray.length > 4 && timePlaceArray[1] == 'EVE') {
        var days = timePlaceArray[0];
        var time = timePlaceArray[2].replace('(', '');
        var startEnd = processTime(time, true);
    } else {
        var timeAndDay = timePlaceArray[0].split(",");
        for (var t = 0; t < timeAndDay.length; t++) {
            var days = timeAndDay[t].substring(0, timeAndDay[t].search(/\d/));
            var time = timeAndDay[t].substr(timeAndDay[t].search(/\d/));
            var startEnd = processTime(time, false);
        }
    }
    return [days, startEnd];
}
