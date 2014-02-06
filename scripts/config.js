var term = 'SP';

var current_year = "2014";

var current_term_facet = "Spring";

/*
Need in formate YYYYMMDD
no spaces for google calendar exporter
*/
var last_date = "20140515";

/*
Dates of the first classes starting
on each day of the week
Format: YYYY-MM-DDT
*/
var first_date = "2014-02-04T";

/*
Color table to be used to determine event color in the mini-calendar
*/
var colorTable = [
    {   color:      "#F01E4F",
        used:       false
    },
    {   color:      "#41607F",
        used:       false
    },
    {   color:      "#C69EE4",
        used:       false
    },
    {   color:      "#C28F0E",
        used:       false
    },
    {   color:      "#79CE9D",
        used:       false
    },
    {   color:      "#7A652F",
        used:       false
    },
    {   color:      "#CCFF33",
        used:       false
    },
    {   color:      "#66FF00",
        used:       false
    },
    {   color:      "#3333FF",
        used:       false
    },
    {   color:      "#9900CC",
        used:       false
    },
    {   color:      "#CCCCCC",
        used:       false
    },
    {   color:      "#FF0099",
        used:       false
    },
    {   color:      "#CCFFFF",
        used:       false
    },
    {   color:      "#666699",
        used:       false
    },
    {   color:      "#FF6600",
        used:       false
    }
];

/*
Gets a new color for a new event in the mini timegrid
*/
function getNewColor() {
    for (var i = 0; i < colorTable.length; i++) {
        var entry = colorTable[i];
        if (!entry.used) {
            entry.used = true;
            return entry.color;
        }
    }
    return "black";
}

/*
Releases a color in the color table for reuse for another event
*/
function releaseColor(c) {
    for (var i = 0; i < colorTable.length; i++) {
        var entry = colorTable[i];
        if (c == entry.color) {
            entry.used = false;
        }
    }
}

/*
Reserves a color in the color table so it can't be used
for duplicate events
*/
function reserveColor(c) {
    for (var i = 0; i < colorTable.length; i++) {
        var entry = colorTable[i];
        if (c == entry.color) {
            if (!entry.used) {
                entry.used = true;
                return entry.color;
            } else {
                return getNewColor();
            }
        }
    }
}

/*
Resets the color table so that all the colors are usable
*/
function resetColorTable() {
    for (var i in colorTable) {
        colorTable[i].used = false;
    }
}

//finds what type of section it is for labeling purposes
var sectionTypeToData = {
    "LectureSession": {
        linkage:    "lecture-section-of",
        postfix:    "(lecture)"
    },
    "RecitationSession": {
        linkage:    "rec-section-of",
        postfix:    "(rec)"
    },
    "LabSession": {
        linkage:    "lab-section-of",
        postfix:    "(lab)"
    }
}

//maps GIR notation to course numbers
var girData = {
	"GIR:PHY1": ["8.01", "8.011", "8.012", "8.01L"],
	"GIR:PHY2": ["8.02", "8.022", "8.021"],
	"GIR:CAL1": ["18.01", "18.014", "18.01A"],
	"GIR:CAL2": ["18.02", "18.022", "18.023", "18.024", "18.02A"],
	"GIR:BIOL": ["7.012", "7.013", "7.014"],
	"GIR:CHEM": ["3.091", "5.111", "5.112"]
}