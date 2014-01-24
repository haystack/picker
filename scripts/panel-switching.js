/* Formerly part of browse.js ; look there for svn history */

function onShowScheduleDetails() {
    $("#browsing-interface").css("visibility: hidden");
    $("#schedule-preview-pane").css("visibility: hidden");
    $("#left-wrapper").css("visibility: hidden");
    
    $("#schedule-details-layer").css("visibility: visible");
    
    scroll(0, 0);
}

function onShowSchedulePreview() {
    $("#schedule-details-layer").css("visibility: hidden");
    
    $("#browsing-interface").css("visibility: visible");
    $("#schedule-preview-pane").css("visibility: visible");
    $("left-wrapper").css("visibility: visible");
    
    scroll(0, 0);
}
