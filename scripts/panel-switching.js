/* Formerly part of browse.js ; look there for svn history */

function onShowScheduleDetails() {
    document.getElementById("browsing-interface").style.visibility = "hidden";
    document.getElementById("schedule-preview-pane").style.visibility = "hidden";
    document.getElementById("left-wrapper").style.visibility = "hidden";
    
    document.getElementById("schedule-details-layer").style.visibility = "visible";
    
    scroll(0, 0);
}

function onShowSchedulePreview() {
    document.getElementById("schedule-details-layer").style.visibility = "hidden";
    
    document.getElementById("browsing-interface").style.visibility = "visible";
    document.getElementById("schedule-preview-pane").style.visibility = "visible";
    document.getElementById("left-wrapper").style.visibility = "visible";
    
    scroll(0, 0);
}
