/* Formerly part of browse.js ; look there for svn history */

function onShowScheduleDetails() {
    $("#browsing-interface").css("visibility", "hidden");
    $("#browsing-interface").css("display", "none");
    
    $("#schedule-preview-pane").css("visibility", "hidden");
    $("#schedule-preview-pane").css("display", "none");
    
    $("#left-wrapper").css("visibility", "hidden");
    $("#left-wrapper").css("display", "none");
    
    $("#schedule-details-layer").css("visibility", "visible");
    $("#schedule-details-layer").css("display", "block");
    
    editMiniTimegridTitles();
    scroll(0, 0);
}

function onShowSchedulePreview() {
    $("#schedule-details-layer").css("visibility", "hidden");
    $("#schedule-details-layer").css("display", "none");
    
    $("#browsing-interface").css("visibility", "visible");
    $("#browsing-interface").css("display", "block");
    
    $("#schedule-preview-pane").css("visibility", "visible");
    $("#schedule-preview-pane").css("display", "block");
    
    $("#left-wrapper").css("visibility", "visible");
    $("#left-wrapper").css("display", "block");
    
    editMiniTimegridTitles();
    scroll(0, 0);
}
