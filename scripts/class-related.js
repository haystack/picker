/*
 * @description Maintenance of picked-classes -- stores data
 * class-related.js
 */

// no elegant way to do this, since multiple sections might correspond to a given class.
// other than this, we'd have to figure out each time whether to actually mark a class as
// added or deleted based on the classes each section in picked-sections corresponds to.
function enableClassList() {
	var collection = window.exhibit.getCollection("picked-sections");
    collection.addListener({ onItemsChanged: function() {
            var sections = collection.getRestrictedItems();
            var classes = new Exhibit.Set();
            if (sections.size() > 0) {
                sections.visit(function(sectionID) {
                    var type = window.database.getObject(sectionID, "type");
                    var classID = window.database.getObject(sectionID, sectionTypeToData[type].linkage);

                    classes.add(classID);
                })
            }
            var pickedClasses = window.exhibit.getCollection("picked-classes");
            pickedClasses._items = classes;
            pickedClasses._onRootItemsChanged();

            updateStoredDataFromExhibit();

            // blurb to update pre-registration div - only active at certain times
            if (classes.size() > 0) {
                var div = document.getElementById('pre-register');
                var text = ['<input type="button" onclick="document.location=\'https://student.mit.edu/cgi-bin/sfprwtrm.sh?'];
                text.push(classes.toArray().join(","));
                text.push('\'" value="Pre-register these classes"/>');
                div.innerHTML = text.join('');
            }
        }
    });
}

/**
 * Function for determining if classes conflict in terms of prereqs
 */
prereqs = [];
preq = [];
function findPrereqs() {
	var collection = window.exhibit.getCollection("picked-sections");
	classes = []
	for (item in collection._items._hash) {
	    classes.push(item);
	}
	
	courses = classesToCourses(classes);
	courses = jQuery.map(courses, function(elem) {return elem.slice(3, elem.length)});
	var uniquecourses = [];
	$.each(courses, function(i, elem) {
		if($.inArray(elem, uniquecourses) === -1) uniquecourses.push(elem);
	    });
	
	for (clss in classes) {
		for (uniquecourse in uniquecourses) {
			cl = classes[clss].slice(3, classes[clss].length);
			file = "data/class-data/" + uniquecourses[uniquecourse] + ".json";
			$.getJSON(file, function(data) {
			    $.each(data.items, function(i,item){
				if (item.id != undefined) {
					if (item.id === cl) {
					    preq.push(item.prereqs);
					}
				}
			    });
			    checkPrereqs();
			});
		}
	}
}

function checkPrereqs() {
	var collection = window.exhibit.getCollection("picked-sections");
	splicedp = []
	$.each(preq, function(i, elem) {
		splice = elem.split(", ");
		for (s in splice) {
			splicedp.push(splice[s]);
		}
	});
	
	preq = splicedp;
	$.each(preq, function(i, elem) {
		if($.inArray(elem, prereqs) === -1) prereqs.push(elem);
	});
	
	conflicts = []
	for (item in collection._items._hash) {
	    cl = item.slice(3, item.length);
	    if($.inArray(cl, prereqs) !== -1) {
		conflicts.push(cl);
	    }
	}
	if(conflicts.length > 0) {
		console.log("Conflicts exist. They are: " + conflicts);
	}
}

function submitBooksQuery() {
    var classes = window.exhibit.getCollection("picked-classes").getRestrictedItems();
    var db = window.exhibit.getDatabase();
    var isbns = [];
    classes.visit(function(classID) {
        var books = db.getSubjects(classID, "class-textbook-of");
        books.visit(function(bookID) {
            isbn = db.getObject(bookID, "isbn");
            // "0393925161 (pbk.)" to "0393925161"
            isbn = isbn.split(' ')[0];
            isbns.push(isbn);
            });
        });
    var isbnText = isbns.join(',');
    window.location = 'http://bookspicker.com/#search?bundle='+isbnText+',&q='+isbnText+',';
    return;
}

function getStoredSections() {
	debugger;
    var mysqlSections;
    var userID = window.database.getObject('user', 'userid');
    if (userID != null) {
        $.ajax({ type: 'POST',
            url: 'data/user.php',
            data: { 'userid' : userID, 'getPickedSections' : true},
            async: false,
            dataType: 'json',
            success: function(data) {
                mysqlSections = data;
            }
        });
        return mysqlSections;
    }
}
