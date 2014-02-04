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
var first_monday = "2014-02-10T";
var first_tuesday = "2014-02-04T";
var first_wednesday = "2014-02-05T";
var first_thursday = "2014-02-06T";
var first_friday = "2014-02-07T";

var courses = [
    {   number: "1",
        name:   "Civil and Environmental Engineering"
    },
    {   number:  "2",
        name:    "Mechanical Engineering"
    },
    {   number:  "3",
        name:    "Materials Science and Engineering"
    },
    {   number: "4",
        name:   "Architecture"
    },
    {   number: "5",
        name:   "Chemistry"
    },
    {   number: "6",
        name:   "Electrical Engineering and Computer Science"
    },
    {   number: "6-7",
        name: "Computer Science and Molecular Biology",
        interdepartmental: true
    },
    {   number: "7",
        name:   "Biology"
    },
    {
        number: "PRE",
        name: "Recommended premed classes",
        interdepartmental: true
    },
    {   number:  "8",
        name:    "Physics"
    },
    {   number: "9",
        name:   "Brain and Cognitive Sciences"
    },
    {   number: "10",
        name:   "Chemical Engineering"
    },
    {   number:  "11",
        name:    "Urban Studies and Planning"
    },
    {   number: "12",
        name:   "Earth, Atmospheric, and Planetary Sciences"
    },
    {   number: "13",
        name: "Ocean Engineering"
    },
    {   number: "14",
        name:   "Economics"
    },
    {   number: "15",
        name:   "Business (see Sloan School of Management)"
    },
    {   number: "16",
        name:   "Aeronautics and Astronautics"
    },
    {    number:    "17",
        name:    "Political Science"
    },
    {    number:    "18",
        name:    "Mathematics"
    },
    {   number: "18C",
        name: "Mathematics with Computer Science",
        interdepartmental: true
    },
    {   number: "20",
        name:   "Biological Engineering"
    },
    {   number: "21A",
        name:   "Anthropology",
    },
    {   number: "21F",
        name:   "Foreign Languages and Literatures"
    },
    {   number: "21H",
        name:   "History"
    },
    {    number:    "21L",
        name:    "Literature"
    },
    {    number:    "21M",
        name:    "Music and Theater Arts"
    },
    {    number:    "21W",
        name:    "Writing and Humanistic Studies"
    },
    {    number:    "22",
        name:    "Nuclear Science and Engineering"
    },
    {   number: "24",
        name:   "Linguistics and Philosophy"
    },
    {    number:    "CC",
        name:    "Concourse"
    },
    {   number: "CMS",
        name:   "Comparative Media Studies"
    },
    {    number:    "CSB",
        name:    "Computational and Systems Biology"
    },
    {    number:    "EC",
        name:    "Edgerton Center"
    },
    {    number:    "ES",
        name:    "Experimental Study Group"
    },
    {   number: "ESD",
        name:   "Engineering Systems Division"
    },
    {   number: "HST",
        name:   "Health Sciences and Technology"
    },
    {
	number: "GEL",
	name:   "Engineering Leadership",
	interdepartmental: true
    },
    {   number:  "MAS",
        name:    "Media Arts and Sciences (Media Lab)"
    },
    {   number: "OR",
        name: "Operations Research",
        interdepartmental: true
    },
    {    number:    "AS",
        name:    "ROTC - Aerospace Studies"
    },
    {    number:    "MS",
        name:    "ROTC - Military Science"
    },
    {    number:    "NS",
        name:    "ROTC - Naval Science"
    },
    {   number:  "STS",
        name:    "Science, Technology, and Society"
    },
// no data here
/*
    {    number:    "SWE",
        name:    "Engineering School-Wide Electives"
    },
*/
    {   number:  "SP",
	    name:	 "Special Programs"
    },
    {   number: "WGS",
        name: "Women's and Gender Studies"
    },
    {   number: "hass_d",
        name: "Hass Distribution"
    }

];

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
function releaseColor(c) {
    for (var i = 0; i < colorTable.length; i++) {
        var entry = colorTable[i];
        if (c == entry.color) {
            entry.used = false;
        }
    }
}

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

var girData = {
	"GIR:PHY1": ["8.01", "8.011", "8.012", "8.01L"],
	"GIR:PHY2": ["8.02", "8.022", "8.021"],
	"GIR:CAL1": ["18.01", "18.014", "18.01A"],
	"GIR:CAL2": ["18.02", "18.022", "18.023", "18.024", "18.02A"],
	"GIR:BIOL": ["7.012", "7.013", "7.014"],
	"GIR:CHEM": ["3.091", "5.111", "5.112"]
}