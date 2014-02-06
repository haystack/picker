/*
 * @description Maintenance of picked-classes -- stores data
 */

function getStoredSections() {
    var mysqlSections;
    var userID = window.database.getObject('user', 'userid');
    if (userID != null) {
        $.ajax({ type: 'POST',
            url: 'data/user.php',
            data: { 'userid' : userID, 'getPickedSections' : true, 'semester': term + current_year },
            async: false,
            dataType: 'json',
            success: function(data) {
                mysqlSections = data;
            }
        });
        return mysqlSections;
    }
}
