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
        obj.coords = {x: 550, y: 100};
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
	$("#" + clss.sectionID.split(".")[0] + clss.sectionID.split(".")[1]).append("<button onclick='onUnpick(this);' class='remove-preview' sectionID='" 
            + clss.sectionID + "'>X</button>");
        $("#" + clss.sectionID.split(".")[0] + clss.sectionID.split(".")[1]).append("<a href='javascript: {}' class='clickable-classes'" + clss.sectionID + " style='display: block; background-color:" + clss.color
            + "; color: white; width: 90%; padding: 5px;' onclick = 'showClickedClassDetails(\"" + clss.classID + "\");' >" + clss.classID + " - " + clss.classLabel + " (" + clss.type.split("S")[0] + ")</a>");
    }
}

/*
Shows a clicked class's detail by using the search facet
*/
function showClickedClassDetails(clss) {
	if ($("#schedule-details-layer").css("visibility") != "visible") {
		removeSelectedTags();
		$(".text_search input").val(clss);
		$('.text_search input').keyup();
		$('.text_search input').keydown();
	} else {
		$(processPrereqs(clss, true)).click();
	}
}

/*
Removes a selected cloud facet tag when clicking class details
*/
function removeSelectedTags() {
    var cloudFacets = $(".exhibit-cloudFacet-value.exhibit-cloudFacet-value-selected");
    while (cloudFacets.length > 0) {
	$(cloudFacets[0]).trigger("click");
	cloudFacets = $(".exhibit-cloudFacet-value.exhibit-cloudFacet-value-selected");
    }
}

/*
Shows and hides class details (comments and ratings) on mouseover
*/
function showMoreDetails(elem) {
	$($(elem).find(".show-more-details")[0]).css({
		"visibility": "visible",
		"display": "block"
	});
}

function showExtraDetails(elem) {
	if (window.database.getObject("user", "userid") != null && window.database.getObject("user", "userid") != undefined) {
		$($(elem).find(".hidden-class-details")).slideToggle("fast").css({
			"visibility": "visible",
			"display": "block"
		});
		
		if ($(elem).find("#course-eval-" + $(elem).attr("itemid")).length == 0) {
			$eval = "https://edu-apps.mit.edu/ose-rpt/subjectEvaluationSearch.htm?termId=&departmentId=&subjectCode=" + $(elem).attr("itemid") + "&instructorName=&search=Search";
			$link = $("<a></a>", {
			    id: "course-eval-" + $(elem).attr("itemid"),
			    href: $eval,
			    text: "MIT " + $(elem).attr("itemid") + " Course Evaluation"
			});
			$(elem).find(".course-eval").append($link);
		}
		
		if ($(elem).attr("itemid").split(".")[0] == "6" && $(elem).find("#hkn-eval-" + $(elem).attr("itemid")).length == 0) {
		    $hkn = "https://hkn.mit.edu/new_ug/search/show_eval/" + $(elem).attr("itemid") + "-" + hknreviewyear;
		    $hknlink = $("<a></a>", {href: $hkn,
				 id: "hkn-eval-" + $(item).attr("itemid"),
				 text: "HKN Evaluation"});
		    $(elem).find(".course-eval").append("<br>").append($hknlink);
		}
		
		if ($(elem).find("#enrollment-" + $(elem).attr("itemid")).length == 0) {
			$.post("data/getExtraDetails.php", {
			    getEnrollment: true,
			    classID: $(elem).attr("itemid"),
			    userid: window.database.getObject("user", "userid"),
			    semester: term + current_year
			}, function (data) {
			    var obj = $.parseJSON( data );
			    if (obj.items.length == 0) {
				    $(elem).find(".enrollment").append("<p class='picker-ratings' id='enrollment-'"+ $(elem).attr("itemid") + "'>Currently no Picker users enrolled in " + $(elem).attr("itemid") + "</p>");
			    } else {
				    $(elem).find(".enrollment").append("<b class='picker-ratings'>Picker users enrolled in " + $(elem).attr("itemid") + ":</b></br>");
			    }
			    $(elem).find(".enrollment").append("<p class='picker-ratings' id='enrollment-" + $(elem).attr("itemid") + "'>" + obj.items.join(", ") + "</p>");
			    if (obj.items.indexOf(window.database.getObject("user", "athena")) > -1) {
				var id = "#enroll-button-" + $(elem).attr("itemid");
				id = id.replace(".", "\\.");
				$(elem).find(id).html("Disenroll");
			    }
			});
		}
		
		if ($(elem).find((".comments-of-" + $(elem).attr("itemid")).replace(".", "\\.")).length == 0) {
			$.post("data/getExtraDetails.php", {
				getComments: true,
				userid: window.database.getObject("user", "userid"),
				athena: window.database.getObject("user", "athena"),
				classID: $(elem).attr("itemid")
			}, function (data) {
				var json = $.parseJSON(data);
				var thisComment = $(elem).find(("#comment-" + $(elem).attr("itemid")).replace(".", "\\."));
				if (json.items.length == 0) {
					thisComment.append("<p class='picker-ratings comments-of-"+ $(elem).attr("itemid") + "'>Currently no comments.</p>");
				} else {
					thisComment.append("<table width='100%'></table>");
					$.each(json.items, function (i, obj) {
						thisTable = $(thisComment.find("table")[0]);
						thisTable.append("<tr style='border-bottom: thin solid #f3f3f3;'></tr>");
						
						var thisRow = $(thisTable.find("tr")[i]);
						thisRow.append("<td class='comments-first-col' width='3%' style='padding:10px'></td>");
						thisRow.append("<td class = 'comments-second-col' width='17%' style='padding:10px'></td>");
						thisRow.append("<td class='comments-third-col' width='80%' style='padding:10px'></td>");
						
						var firstColumn = $(thisRow.find("td")[0]);
						var secondColumn = $(thisRow.find("td")[1]);
						var thirdColumn = $(thisRow.find("td")[2]);
						
						secondColumn.append("<span class='ui-icon ui-icon-plusthick" + ((obj.votedUp == "true") ? " plusClicked" : "") + "' classid='" + obj.id + "' " + "onmouseover='userData.plusOn(this);return false;' onclick='userData.plusClick(this);return false;' onmouseout='userData.plusOff(this);return false;'></span>" );
						secondColumn.append("<span class='ui-icon ui-icon-minusthick" + ((obj.votedDown == "true") ? " minusClicked" : "") + "' classid='" + obj.id + "' " + "onmouseover='userData.minusOn(this);return false;' onclick='userData.minusClick(this);return false;' onmouseout='userData.minusOff(this);return false;'></span>" );
						secondColumn.append("<span class='ui-icon ui-icon-flag" + ((obj.flagClicked == "true") ? " flagClicked" : "") + "' classid='" + obj.id + "' " + "onmouseover='userData.flagOn(this);return false;' onclick='userData.flagClick(this);return false;' onmouseout='userData.flagOff(this);return false;'></span>" );
						firstColumn.append("<span class='picker-ratings'>" + obj.votes + "</span>");
						thirdColumn.append("<p class='picker-ratings comments-of-"+ $(elem).attr("itemid") + "'>" + obj.comment + "</p><br>");
						if (obj['is-current-user']) {
							thirdColumn.append("<span class='picker-ratings'><i>Comment by:</i> " + obj.author + " <i>on</i> " + obj.timestamp + "</span><br><span><a classid='" + obj.id + "' href='#'" + " onclick='userData.deleteComment(this);return false;'>delete</a></span><br>" );	
						}
					});
				}
			});
		}
	} else {
		$($(elem).find(".show-more-details")[0]).append("<p class='picker-ratings'>You must <a href='https://quanquan.scripts.mit.edu:444/demo1/upgrade/'>LOGIN</a> to see more details.</p>");
	}
	
	$($($(elem).find(".show-more-details")[0]).find("a.picker-ratings")).html("Hide more details");
	showOrHide(elem);
}

/*
 Hides the prompt for more details.
 */
function hideMoreDetails(elem) {
	$($(elem).find(".show-more-details")[0]).css({
		"visibility": "hidden",
		"display": "none"
	});	
}

/*
Hides class details (comments and ratings)
*/
function hideExtraDetails(elem) {
    if (window.database.getObject("user", "userid") != null && window.database.getObject("user", "userid") != undefined) {
	$($(elem).find(".hidden-class-details")).slideToggle("fast");
	$(elem).find(".course-eval").empty();
	$(elem).find(".enrollment").empty();
	$(elem).find(("#comment-" + elem.attr("itemid")).replace(".", "\\.")).empty();
    } else {
	$($($(elem).find(".show-more-details")[0]).find("p")).empty();
    }
    $($($(elem).find(".show-more-details")[0]).find("a.picker-ratings")).html("Show more details");
    showOrHide(elem);
}

/*
Gets the class text to search when clicking on the class in the calendar
*/
function getClickedClass(evt) {
    return evt.split("-")[0];
}

/*
 Either shows or hides the extra details
 */
function showOrHide(elem) {
	var moreDeets = $($($(elem).find(".show-more-details")[0]).find("a.picker-ratings"));
	var showHideOnclick = (moreDeets.html() == "Show more details") ?  "showExtraDetails($(this).parents('.course-lens'));" : "hideExtraDetails($(this).parents('.course-lens'));";
	moreDeets.attr("onclick", showHideOnclick);
	moreDeets.html((moreDeets.html() == "Show more details") ? "Show more details" : "Hide more details" );
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
    toggleUnitAdder();
}