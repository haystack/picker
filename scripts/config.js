var term = 'FA';

var current_year = "2015";

var current_term_facet = "Fall";

/*
Need in formate YYYYMMDD
no spaces for google calendar exporter
*/
var last_date = "20141220";

/*
Dates of the first classes starting
on each day of the week
Format: YYYY-MM-DDT
*/
var first_date = "2014-09-01T";

/*
 Year of most recent HKN reviews
 */
var hknreviewyear = "f2012";

/*
Color table to be used to determine event color in the mini-calendar
*/
var colorTable = [
    {   color:      "#447C69",
        used:       false
    },
    {   color:      "#9162B6",
        used:       false
    },
    {   color:      "#E279A3",
        used:       false
    },
    {   color:      "#5698C4",
        used:       false
    },
    {   color:      "#74C493",
        used:       false
    },
    {   color:      "#4E2472",
        used:       false
    },
    {   color:      "#A34974",
        used:       false
    },
    {   color:      "#F19670",
        used:       false
    },
    {   color:      "#8B0000",
        used:       false
    },
    {   color:      "#8E8C6D",
        used:       false
    },
    {   color:      "#7C9FB0",
        used:       false
    },
    {   color:      "#E6E6FA",
        used:       false
    },
    {   color:      "#E2975D",
        used:       false
    },
    {   color:      "#ADFF2F",
        used:       false
    },
    {   color:      "#51574A",
        used:       false
    },
    {   color:      "#191970",
        used:       false
    },
    {   color:      "#006400",
        used:       false
    },
    {   color:      "#483D8B",
        used:       false
    },
    {   color:      "#800000",
        used:       false
    },
    {   color:      "#CD5C5C",
        used:       false
    },
    {   color:      "#FF00FF",
        used:       false
    },
    {   color:      "#BDB76B",
        used:       false
    },
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
