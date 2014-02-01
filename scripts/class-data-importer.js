/**
 * @fileOverview Read and convert JSON feed from data warehouse.
 * @author Quanquan Liu <quanquan@mit.edu>
 */

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
	var crossListedClasses = [];
	var items = json.items;

    var saved_sections = getStoredSections();
    console.log(saved_sections);
    var picked_classes = readCookie("picked-classes");
    var saved_data = parseSavedClasses(picked_classes);
    var sections = saved_data.map(function (element) { return element.sectionID });

    if (saved_sections) {
        sections = uniqueArray(sections.concat(saved_sections));
    }

    var cookies = [];
    var idToNames = {};

    for (var i = 0; i < items.length; i++) {
        var item = items[i];

        if (sections.indexOf(item.label) > -1) {
            var c = new Object();
            c.sectionID = item.label;
            c.classID = item['section-of'];
            c.timeAndPlace = item.timeAndPlace;
            c.type = item.type;
            c.sectionData = sectionTypeToData[item.type];
            cookies.push(c);
        }

        if (item.type === "Class") {
            idToNames[item.id] = item.label;
        }

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

    if (crossListedClasses.length > 0) {
        loadIndividualClasses(crossListedClasses);
    }
    /*
    	Moved from onLoad in browse.js because
    	of database loading issues
    */

    for (i in cookies) {
        cookies[i].classLabel = idToNames[cookies[i].classID]
        updateCookie(cookies[i].sectionID, true, cookies[i].classID, cookies[i].classLabel, cookies[i].timeAndPlace, cookies[i].type, cookies[i].sectionData);
        console.log(cookies[i].sectionID + true + cookies[i].classID + cookies[i].classLabel + cookies[i].timeAndPlace + cookies[i].type + cookies[i].sectionData);
    }

    getAddOrRemove();
    updatePickedClassesList();
    loadStaticData("data/user.php", window.database, setupLogin, updateExhibitSections, sections);

    if (Timegrid.listener) {
        $(".timegrid-vline").each(function(i, obj) {
            $(this).bind("click", function() {Timegrid.listener($(this))});
        });
    }

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
registers importer using jquery
*/
$(document).one(
    "registerJSONPImporters.exhibit",
    ExhibitImporter._register
);
