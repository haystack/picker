var debug = (document.location.search == "?debug");

var facetData = {
    'course-facet': {
        expression: '.course',
        facetLabel: 'course &raquo;',
        height:     '10em'
    },
    'level-facet': {
        expression: '.level',
        facetLabel: 'level &raquo;',
        height:     '4em'
    },
    'topic-facet': {
        expression: '.topic',
        facetLabel: 'topic &raquo;',
        height:     '20em'
    }
};

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
