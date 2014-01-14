/*==================================================
 * Exhibit extensions
 *==================================================
 */
Exhibit.Functions["building"] = {
    f: function(args) {
        var building = "";
        args[0].forEachValue(function(v) {
            building = v.split("-")[0];
            return true;
        });
        return new Exhibit.Expression._Collection([ building ],  "text");
    }
};

/*==================================================
 * Initialization
 *==================================================
 */
function onLoad() {
    var urls = [ ];
    urls.push("data/iap/iap-for-credit-classes.js");
    urls.push("data/iap/iap-for-credit-lectures.js");
    urls.push("data/iap/iap-for-credit-sections.js");
    urls.push("data/schema.js");

    window.database = Exhibit.Database.create();
    
    var fDone = function() {
        var pickedSections = new Exhibit.Collection("picked-sections", window.database);
        pickedSections._update = function() {
            this._items = this._database.getSubjects("true", "picked");
            this._onRootItemsChanged();
        };
        pickedSections._update();
        
        window.exhibit = Exhibit.create();
        window.exhibit.setCollection("picked-sections", pickedSections);
        window.exhibit.configureFromDOM();
        
        /* For collapsable facets -- I don't know if we're going to need these
        setupExistingFacet(document.getElementById("course-facet"));
        setupExistingFacet(document.getElementById("grading-facet"));
        setupExistingFacet(document.getElementById("total-units-facet"));
        */

        enableIAPTimegrid();
        
        document.getElementById("left-column").style.display = "block";
    };
    loadURLs(urls, fDone);
}

function loadURLs(urls, fDone) {
    var fNext = function() {
        if (urls.length > 0) {
            var url = urls.shift();
            var importer = Exhibit.importers["application/json"];
            importer.load(url, window.database, fNext);
        } else {
            fDone();
        }
    };
    fNext();
}

/*==================================================
 * Favorites
 *==================================================
 */
function toggleFavorite(img) {
    var classID = img.getAttribute("classID");
    var favorite = window.database.getObject(classID, "favorite") == "true";
    if (favorite) {
        SimileAjax.History.addLengthyAction(
            function() { undoFavorite(classID, img) },
            function() { doFavorite(classID, img) },
            "Unfavorite " + classID
        );
    } else {
        SimileAjax.History.addLengthyAction(
            function() { doFavorite(classID, img) },
            function() { undoFavorite(classID, img) },
            "Favorite " + classID
        );
    }
}

function doFavorite(classID, img) {
    window.database.addStatement(classID, "favorite", "true");
    img.src = "images/yellow-star.png";
}

function undoFavorite(classID, img) {
    window.database.removeStatement(classID, "favorite", "true");
    img.src = "images/gray-star.png";
}

function processShowOnlyFavoriteClasses() {
    processShowChoice("show-favorites", "Show favorites only");
}
function processShowAllClasses() {
    processShowChoice("show-all", "Show all classes");
}
function processShowOnlyAddedClasses() {
    processShowChoice("show-added", "Show added classes only");
}

var currentShowChoice = "show-all";
function processShowChoice(newShowChoice, action) {
    var oldShowChoice = currentShowChoice;
    SimileAjax.History.addLengthyAction(
        function() { 
            currentShowChoice = newShowChoice;
            updateShowChoice();
        },
        function() { 
            currentShowChoice = oldShowChoice;
            updateShowChoice();
        },
        action
    );
};

function updateShowChoice() {
    switch (currentShowChoice) {
    case "show-all":
        showAllClasses();
        break;
    case "show-added":
        showAddedOnly();
        break;
    case "show-favorites":
        showFavoritesOnly();
        break;
    }
    document.getElementById(currentShowChoice).checked = true;
};

function showFavoritesOnly() {
    var collection = window.exhibit.getDefaultCollection();
    collection._items = window.database.getSubjects("true", "favorite");
    collection._onRootItemsChanged();
}

function showAddedOnly() {
    var collection = window.exhibit.getDefaultCollection();
    collection._items = window.database.getObjectsUnion(window.database.getSubjects("true", "picked"), "class");
    collection._onRootItemsChanged();
}

function showAllClasses() {
    var collection = window.exhibit.getDefaultCollection();
    collection._items = window.database.getSubjects("Class", "type");
    collection._onRootItemsChanged();
}

/*==================================================
 * Section picking
 *==================================================
 */

function onPickUnpick(button) {
    var sectionID = button.getAttribute("sectionID");
    var picked = window.database.getObject(sectionID, "picked") == "true";
    if (picked) {
        SimileAjax.History.addLengthyAction(
            function() { doUnpick(sectionID) },
            function() { doPick(sectionID) },
            "Unpicked " + sectionID
        );
    } else {
        SimileAjax.History.addLengthyAction(
            function() { doPick(sectionID) },
            function() { doUnpick(sectionID) },
            "Picked " + sectionID
        );
    }
};

function onUnpick(button) {
    var sectionID = button.getAttribute("sectionID");
    SimileAjax.History.addLengthyAction(
        function() { doUnpick(sectionID) },
        function() { doPick(sectionID) },
        "Unpicked " + sectionID
    );
};

function doPick(sectionID) {
    window.database.addStatement(sectionID, "picked", "true");
    window.database.addStatement(sectionID, "color", getNewColor());
    window.database.removeStatement(sectionID, "temppick", "true");
    
    window.exhibit.getCollection("picked-sections")._update();

    showHidePickDiv(sectionID, true);
}
function doUnpick(sectionID) {
    var color = window.database.getObject(sectionID, "color");
    releaseColor(color);
    
    window.database.removeStatement(sectionID, "picked", "true");
    window.database.removeStatement(sectionID, "color", color);
    
    window.exhibit.getCollection("picked-sections")._update();
    
    showHidePickDiv(sectionID, false);
}

function onMouseOverSection(div) {
    //if (!SimileAjax.Platform.browser.isIE) {
        var sectionID = div.getAttribute("sectionID");
        if (window.database.getObject(sectionID, "picked") == null) {
            updateIAPTimegrid(true, sectionID);
        }
    //}
}
function onMouseOutSection(div) {
    //if (!SimileAjax.Platform.browser.isIE) {
        var sectionID = div.getAttribute("sectionID");
        if (window.database.getObject(sectionID, "picked") == null) {
            updateIAPTimegrid(true, null);
        }
    //}
}
function showHidePickDiv(sectionID, picked) {
    var thediv = document.getElementById("divid-" + sectionID);
    if (thediv != null) {
        thediv.className = picked ? "each-section-picked" : "each-section-unpicked";
        
        var button = thediv.getElementsByTagName("button")[0];
        button.innerHTML = picked ? "Remove" : "Add";
    }
}
