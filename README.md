migrating picker to E3

TODO:

look to see if SimileAjax functionalities is included in Exhibit 3. They could be: for example, Exhibit.includeJavascriptFiles() is included.

BUGS:<br>
1. event listener goes away after picking classes: DONE! <br>
2. Safari filter boxes loses styling: pretty sure I didn't do anything so it magically FIXED itself!  <br>
3. Mobile picking doesn't work: took a look at this, might be a lot of work, put with final styling changes. <br>
4. No comments or ratings yet: DONE! <br>
4.a. Need to fix getting and pushing comments: FIXED! <br>
4.b. Need to implement anonymous commenting: DONE! <br>
UI STUFF: DO IT WITH STYLING and use jQuery UI: http://api.jqueryui.com/theming/icons/ DONE!
4.c. Need to implement up and down voting. DONE! <br>
4.d. Need to implement flagging. DONE! <br>
4.e. Need to implement loading more comments with scrolling, could do this last with my day of css styling. <br>
4.f. Various small UI bugs, such as both plus and minus highlighting, deleting, and ordering by votes and least recent comment can be done with minor changes (probably by adding some javascript or changing the label of the comment).<br>
5. Extra functionality needs to be added: DONE! (Getting rid of bookspicker because not really used/not in keeping with purpose of Course Picker) <br>
6. Sometimes loading issue occurs when trying to load classes onto calendar: FIXED! <br>
7. Loading initial classes take too much time<br>
8. Using the same/similar colors multiple times: FIXED! <br>
9. Add easy login option: DONE!<br>
10. Would be nice to have all browsers read from same cookie<br>
11. Need to clear all tag selections when clicking on a class for details: DONE! <br>
12. Clicking on classes on calendar pulls up class details: DONE! <br>
12.a. Highlighting these picked classes, add with final styling.
13. Clicking on empty squares will color the square and display the available classes during that timeblock. Toggle classes selected and deselected. <br>
14. Need general code cleanup: URGENT BUT DO LAST<br>
15. Insecure content loading issue: FIXED! <br>
16. When moving to picker locker, change the login link to just https:// don't need the port like I had in scripts. Only scripts need the 444 port.<br>
17. Make sure all secure content is under a login <br>
18. STYLING: USE THIS USE THIS: http://jqueryui.com/demos/  <br>
19. Remember to replace "#httpsStatus" with url instead of url with port 444 when migrated to picker namespace.
20. Need to re-position the dialogue bubble when clicking on a class for a particular time.<br>
21. Move all onLoad methods to importer to avoid race conditions: DONE!<br>
22. Make the mouse over expansion smooth like toggle comments <br>
23. Not saving classes after login :(: FIXED! <br>
23.a. Need to add functionality for deleting classes from database: DONE! <br>
23.b. Incorporate choosing right semester as defined in config file: DONE!<br>
23.c. Need to update database each time a new class is picked while logged in: DONE! <br>
23.d. Just as a thought: maybe prompt users when new classes are added without the user being logged in. <br>
24. Revise so that all years' records of picked classes are saved. Better for recommendation building: doing something else but making a note so I don't forget: when adding this, just delete the line "mysql_query("DELETE FROM classes WHERE c_userid=$userid;");": DONE in another way but DONE! <br>
25. Fix all database stuff when changing from local to mit scripts <br>
26. For some reason, the classes are interspersing themselves in between the blocks of time. WHY???? Gotta fix. Took a look, pixel colors might be caused by using the same color for multiple classes. Fix that and then see if this bug still exists.<br>
27. clicking on class and having the class show up in the search filter not working when doing another function: heisenbug? I can't reproduce the bug anymore, oh well...  <br>
28. add HKN and course evaluations ratings <br>
29. add preregistration but only make it visible during times when preregistration is open. to look for example code, look at previous code in class-related.<br>
30. On second thought maybe add back bookspicker for each class under class descriptions<br>
31. Fix unit adder so we get total units. But onwards to UI!<br>
