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
            //in load and process
            processOfficialDataItem(item);
        }
    }

    //in load and process
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
registers importer using jquery
*/
$(document).one(
    "registerJSONPImporters.exhibit",
    ExhibitImporter._register
);
