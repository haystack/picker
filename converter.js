/**
 * @fileOverview Read and convert JSON feed from data warehouse.
 * Writes into new file.
 * @author Quanquan Liu <quanquan@mit.edu>
 */

require('./scripts/config.js');
var request = require('request');
var fs = require('fs');
var url = "http://coursews.mit.edu/coursews/?term=" + current_year + term;
console.log(url);

/*
@json input json for course data from data warehouse
@return processed json for class data
*/
function transformJSON(json) {
	var items = json.items;

    for (var i = 0; i < items.length; i++) {
        var item = items[i];

        // If true this is a cross-listed class, and this is not the "master" class
        // Ex. if this class is 18.062, rename it 6.042
        /*if ('master_subject_id' in item && item.id != item.master_subject_id) {
            // Once both 18.062 and 6.042 are loaded, they will be merged as one class with two courses ["6", "18"]
            items[i] = {"id":item.master_subject_id, "course":item.course, "label":item.label, "type":item.type};
        }
        //Otherwise, this is a regular class -- just load it
        else {*/
        processOfficialDataItem(item);
        //}
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
        item['course_eval'] = '<a target="_blank" href="https://edu-apps.mit.edu/ose-rpt/subjectEvaluationSearch.htm?termId=&departmentId=&subjectCode=' + item.master_subject_id + '&instructorName=&search=Search"> Course Evaluation for ' + item.master_subject_id + '</a>';
        if (item['id'].split(".")[0] == "6") {
            item['course_eval_hkn'] = '<a target = "_blank" href="https://hkn.mit.edu/new_ug/search/show_eval/' + item['id'] + '-' +hknreviewyear + '"> HKN Review for ' + item.master_subject_id + '</a>';
        }
    }

    for (attribute in item) {
        if (item[attribute] == '') { delete item[attribute]; }
    }

    if ('hass_attribute' in item)  {
	    var categories = item['hass_attribute'].split(",");
	    var hasses = [];
	    for (var i = 0; i < categories.length; i++) {
		    if (categories[i] == "HA") {
			    hasses.push("Hass-A");
	    	} else if (categories[i] == "HS") {
			    hasses.push("Hass-S");
		    } else if (categories[i] == "HH") {
			    hasses.push("Hass-H");
		    } else if (categories[i] == "HE") {
			    hasses.push("Hass-E");
		    }
	    }
	    item['hass_attribute'] = hasses;
    }

    if ('comm_req_attribute' in item || 'gir_attribute' in item) {
	    var newReqs = [];
	    if ('comm_req_attribute' in item ) {
		    var reqs = item['comm_req_attribute'].split(",");
		    for (var i = 0; i < reqs.length; i++) {
			    if (reqs[i] == "CIH") {
				    newReqs.push("CI-H");
			    } else if (reqs[i] == "CIM") {
				    newReqs.push("CI-M");
			    } else if (reqs[i] == "CIHW") {
				    newReqs.push("CI-HW");
			    }
		    }
	    }

    	if ('gir_attribute' in item) {
		    reqs = item['gir_attribute'].split(",");
		    for (var i = 0; i < reqs.length; i++) {
			    if (reqs[i] == "BIOL") {
				    newReqs.push("Biology");
			    } else if (reqs[i] == "CAL1") {
				    newReqs.push("Calculus-1");
			    } else if (reqs[i] == "CAL2") {
				    newReqs.push("Calculus-2");
		    	} else if (reqs[i] == "CHEM") {
			    	newReqs.push("Chemistry");
			    } else if (reqs[i] == "LAB" || reqs[i] == "LAB2") {
				    newReqs.push("Lab");
		    	} else if (reqs[i] == "PHY1") {
			    	newReqs.push("Physics-1");
		    	} else if (reqs[i] == "PHY2") {
			    	newReqs.push("Physics-2");
    			} else if (reqs[i] == "REST") {
	    			newReqs.push("REST");
		    	}
	    	}
	    }

	    item['comm_req_attribute'] = newReqs;
    }

    item['in-charge'] = item['in-charge'] + " (Class Admin)";

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

request.get(url, function(err, response, data) {
    if (err || response.statusCode != 200) {
        console.log('Error: ' + err);
        return;
    }

    var json = JSON.parse(data);
    var process_json = JSON.stringify(transformJSON(json));

    fs.writeFile(__dirname + "/processed_class_data.json", process_json,
        function(err) {
            if (err) {
                console.log(err);
            }
    });
});
