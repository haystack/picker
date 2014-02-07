/*===================================================
 * Exhibit extensions
 *==================================================
 */

/** When protocol is https on an MIT server, certificates are automatically authenticated.
    On clicking "login", protocol changes to https, certificates are processed,
    and window.database.getObject("user", "athena") becomes a kerberos ID see user.php.
**/
function setupLogin() {
	var athena = window.database.getObject("user", "athena");
	var url = document.location.href;

    if (window.location.host.search(/localhost/) >= 0 ) {
        if (athena != null) {
            $('#localhostLogin').html(' &bull; logged in as '+athena+'&bull; <a href="'+url+'" onClick="toggleLogin(false);">log out on localhost</a>');
        } else {
            $('#localhostLogin').html(' &bull; <a href="'+url+'" onClick="toggleLogin(true);">log in on localhost</a>');
        }
    }

	else if (document.location.protocol == 'https:' && athena != null) {
		url = url.replace('https:', 'http:');
        //TODO: REPLACE WHEN MIGRATED TO PICKER NAMESPACE
        url = "http://quanquan.scripts.mit.edu/demo1/upgrade/";
		$('#httpsStatus').html('logged in as ' + athena +
			' &bull; <a href="' + url + '">LOGOUT</a>');
	} else {
		url = url.replace('http:', 'https:');
        //TODO: REPLACE WHEN MIGRATED TO PICKER NAMESPACE
        url = "https://quanquan.scripts.mit.edu:444/demo1/upgrade/";
		$('#httpsStatus').html('<a href="' + url + '">LOGIN</a>');
	}

    setupCookiesAndMiniTimegrid();
}

/*
Extra functionality that needs to be loaded after 
Exhibit loads its data from the importer
*/
function setupCookiesAndMiniTimegrid() {
    var saved_sections = getStoredSections();
    var picked_classes = readCookie("picked-classes");
    if (saved_sections) 
        picked_classes = picked_classes + saved_sections.join("");
    writeCookie("picked-classes", picked_classes);
    getAddOrRemove();

}

/*
Used in setupLogin for logging in and logging out
*/
function toggleLogin(login) {
    writeCookie('loggedIn', login);
}

/*==================================================
 * Post-initialization class-loading functionality
 *==================================================
 */

 /*
 Shows the prereqs for a class
 */
function showPrereq(elmt, itemID, coords) {
    coords = coords || null;
    //shows the class details for a class shown in time preview
    if (coords) {
        var obj = new Object();
        //TODO: optimize this
        obj.coords = {x: 1, y: 1};
        Exhibit.UI.showItemInPopup(itemID, elmt, exhibit.getUIContext(), obj);
    }
    else
        Exhibit.UI.showItemInPopup(itemID, elmt, exhibit.getUIContext());
}

/*
Either show or collapse the details of a class
when you click on the header
*/
function toggleClassBody(a) {
    var div=$(a.parentNode).siblings("div")[0];
    if (div.style.display == "none") {
	   div.style.display = "block";
    } else {
	   div.style.display = "none";
    }
    howManyCollapsed();
}

//Checks to see if location is secure (ie uses https)
function isSecure() {
   return location.protocol == 'https:';
}

/*
Gets classes that are saved in cookies and adds them to mini-timegrid
*/
function getAddOrRemove() {
    var picked_classes = readCookie("picked-classes");
    picked_classes = parseSavedClasses(picked_classes);
    picked_classes = uniqueObjArray(picked_classes);

    resetColorTable();

    for (c in picked_classes) {
        var clss = picked_classes[c];
        var sectionID = clss.sectionID;
        clss.color = reserveColor(clss.color);
        window.database.addStatement(sectionID, "picked", "true");
        window.database.removeStatement(sectionID, "temppick", "true");
        window.database.addStatement(sectionID, "color", clss.color);
    }

    fromSavedClassesToCookie(picked_classes);
    updatePickedClassesList();
    updateStoredDataFromExhibit();
    updateMiniTimegrid();
    editMiniTimegridTitles();
}

/*
Updates the panel beneath the mini-timegrid with classes
*/
function updatePickedClassesList() {
    var picked_classes = readCookie("picked-classes");
    picked_classes = parseSavedClasses(picked_classes);
    picked_classes = uniqueObjArray(picked_classes);

    $("#picked-classes-list").empty();
    for (c in picked_classes) {
        var clss = picked_classes[c];
        $("#picked-classes-list").append("<div class='preview-class-lens' id = " + clss.sectionID.split(".")[0] + clss.sectionID.split(".")[1] + "></div>");
        $("#" + clss.sectionID.split(".")[0] + clss.sectionID.split(".")[1]).append("<a href='javascript: {}' class='clickable-classes'" + clss.sectionID + " style='display: block; background-color:" + clss.color
            + "; color: white' onclick = 'showClickedClassDetails(" + clss.classID + ");' >" + clss.classID + " - " + clss.classLabel + " (" + clss.type + ")</a>");
        $("#" + clss.sectionID.split(".")[0] + clss.sectionID.split(".")[1]).append("<button onclick='onUnpick(this);' class='remove-preview' sectionID='" 
            + clss.sectionID + "'>X</button>");
    }
}

/*
Shows a clicked class's detail by using the search facet
*/
function showClickedClassDetails(clss) {
    removeSelectedTags();
    $(".text_search input").val(clss);
    $('.text_search input').keyup();
}

/*
Removes a selected cloud facet tag when clicking class details
*/
function removeSelectedTags() {
    var cloudFacets = $(".exhibit-cloudFacet-value.exhibit-cloudFacet-value-selected");
    for (var i = 0; i < cloudFacets.length; i++) {
        $(cloudFacets[i]).trigger("click");
    }
}

/*
Shows and hides class details (comments and ratings) on mouseover
*/
function showExtraDetails(elem) {
    $($(elem).find(".hidden-class-details")).slideDown("fast").css({
	"visibility": "visible",
	"display": "block"
    });
    
    $eval = "https://edu-apps.mit.edu/ose-rpt/subjectEvaluationSearch.htm?termId=&departmentId=&subjectCode=" + $(elem).attr("itemid") + "&instructorName=&search=Search";
    $link = $("<a></a>", {
	href: $eval,
	text: "MIT " + $(elem).attr("itemid") + " Course Evaluation"
    });
    $(elem).find(".course-eval").append($link);
    if ($(elem).attr("itemid").split(".")[0] == "6") {
	$hkn = "https://hkn.mit.edu/new_ug/search/show_eval/" + $(elem).attr("itemid") + "-s2013";
	$hknlink = $("<a></a>", {href: $hkn,
		     text: "HKN Evaluation"});
	$(elem).find(".course-eval").append("<br>").append($hknlink);
    }
}

/*
Hides class details (comments and ratings)
*/
function hideExtraDetails(elem) {
    $($(elem).find(".hidden-class-details")).slideUp("fast");
    $(elem).find(".course-eval").empty();
}

/*
Gets the class text to search when clicking on the class in the calendar
*/
function getClickedClass(evt) {
    return evt.split("-")[0];
}

/*
Edits the mini-timegrid titles to account for tooltip dropdown
*/
function editMiniTimegridTitles() {
    $(".timegrid-event").each(function (i, obj) {
	if ($("#schedule-details-layer").css("visibility") != "visible") {
		var title = $(obj).attr("title");
		title = title.split("-")[0];
		var child = $(obj).find("div");
		child.html(title);
		child.css("font-size", "10px");
	} else {
		var child = $(obj).find("div");
		var title = $(obj).attr("title");
		child.html(title);
		child.css("font-size", "12px");
	}
    });
}