/* Formerly part of browse.js ; look there for svn history */

function onShowScheduleDetails() {
    SimileAjax.History.addLengthyAction(
        showScheduleDetails,
        showSchedulePreview,
        "Show Schedule Details"
    );
}

function onShowSchedulePreview() {
    SimileAjax.History.addLengthyAction(
        showSchedulePreview,
        showScheduleDetails,
        "Show Classes"
    );
}

function showScheduleDetails() {
    document.getElementById("browsing-interface").style.visibility = "hidden";
    document.getElementById("schedule-preview-pane").style.visibility = "hidden";
    
    document.getElementById("schedule-details-layer").style.visibility = "visible";
    
    scroll(0, 0);
}

function showSchedulePreview() {
    document.getElementById("schedule-details-layer").style.visibility = "hidden";
    
    document.getElementById("browsing-interface").style.visibility = "visible";
    document.getElementById("schedule-preview-pane").style.visibility = "visible";
    
    scroll(0, 0);
}
