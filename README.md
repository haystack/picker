migrating picker to E3

TODO:

look to see if SimileAjax functionalities is included in Exhibit 3. They could be: for example, Exhibit.includeJavascriptFiles() is included.

BUGS:<br>
1. event listener goes away after picking classes<br>
2. Safari filter boxes loses styling <br>
3. Mobile picking doesn't work <br>
4. No comments or ratings yet: DONE! <br>
4.a. Need to fix getting and pushing comments: FIXED! <br>
4.b. Need to implement anonymous commenting: DONE! <br>
UI STUFF: DO IT WITH STYLING and use jQuery UI: http://api.jqueryui.com/theming/icons/
4.c. Need to implement up and down voting.<br>
4.d. Need to implement flagging.<br>
4.e. Need to implement loading more comments with scrolling, could do this last with my day of css styling. <br>
5. Extra functionality needs to be added <br>
6. Sometimes loading issue occurs when trying to load classes onto calendar: FIXED! <br>
7. Loading initial classes take too much time<br>
8. Using the same/similar colors multiple times<br>
9. Add easy login option: DONE!<br>
10. Would be nice to have all browsers read from same cookie<br>
11. Need to clear all tag selections when clicking on a class for details <br>
12. Clicking on classes on calendar pulls up class details <br>
13. Clicking on empty squares will color the square and display the available classes during that timeblock. Toggle classes selected and deselected. <br>
14. Need general code cleanup.<br>
15. Insecure content loading issue: FIXED! <br>
16. When moving to picker locker, change the login link to just https:// don't need the port like I had in scripts. Only scripts need the 444 port.<br>
17. Make sure all secure content is under a login <br>
18. STYLING <br>
19. Remember to replace "#httpsStatus" with url instead of url with port 444 when migrated to picker namespace.
20. Need to re-position the dialogue bubble when clicking on a class for a particular time.<br>
21. Move all onLoad methods to importer to avoid race conditions.<br>
22. Make the mouse over expansion smooth like toggle comments <br>
23. Not saving classes after login :(: working on right now <br>
24. Revise so that all years' records of picked classes are saved. Better for recommendation building: doing something else but making a note so I don't forget: when adding this, just delete the line "mysql_query("DELETE FROM classes WHERE c_userid=$userid;");"<br>
