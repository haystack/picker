/*
 * scripts/user-data.js
 *
 * @description Related functions to handle user input
 * and persistent data, e.g. ratings and feedback.
 *
 * Includes a star rating plugin script
 * Includes user enrollment plugin script
 */

// holds various dependent functions
userData = {

	// not used outside of this file
	getUserID: function(element) {
		var userID = window.database.getObject('user', 'userid');
		if (userID == null) {
			var href = element.baseURI.replace('http:', 'https:');
			this.setMsg(element, 'Must be logged in to input data. <a href="'
				+ href + '">Login</a>');
		}
		return userID;
	},

	// not used outside of this file
	setMsg: function(element, msg) {
		$($(element).parents(".class-comments").find('.message')[0]).css("display", "block").html(msg);
	},
	
	toggleComments: function(anchor) {
		var userID = this.getUserID($(anchor).children()[0]);
		
		if (userID == null)
			$(anchor).siblings(':not(div.input)').toggle("fast");
		else
			$(anchor).siblings().toggle("fast");
	},
	
	comment: function(button) {
		var classID = button.getAttribute("classid");

		var textarea = $(button).parent().find('textarea');
		
		// hide input
		$(button).parent().hide();
		
		var userID = this.getUserID(button);
		var anonymous = $(button).parent().find("input").prop('checked');

		if (userID != null) {
			$.post("scripts/post.php",
				{ "userid": userID,
				  "comment": $(textarea).val(),
				  "class": classID,
				  "anonymous": anonymous + ""
				  },
				function(data){
					userData.setMsg(button, 'Successfully commented: ' + data);
				});
		}
		
		logData(["comment", $(textarea).val()]);
	},
	
	deleteComment: function(anchor) {
		var commentid = anchor.getAttribute("classid");
		
		var userID = this.getUserID($(anchor).parent());
		if (userID != null) {
			$.post("scripts/post.php",
				{ "userid": userID,
				  "comment": true,
				  "deleteComment": true,
				  "commentid": parseInt(commentid)
				  },
				function(data){
					// hide comment div
					$($(anchor).parents("tr")[0]).hide();
				});
		}
		
		logData(["deleted comment", commentid, anchor]);
	},
	
	drain: function(elt) {
		var stars = $(elt).parent().children('.star');
		stars
			.filter('.on').removeClass('on').end()
			.filter('.hover').removeClass('hover').end();
	},
	
	reset: function(value, elt) {
		var siblings = $(elt).parent().children('.star');
		siblings.slice(0, value).addClass('on').end();
	},
	
	starOn: function(star) {
		this.drain(star);
		
		var siblings = $(star).parent().children('.star');
		var index = $(star).children('a').html();
		// fill(this)
		siblings.children('a').css('width', '100%').end();
		siblings.slice(0, index).addClass('hover').end();
	},
	
	starClick: function(star) {
		var userID = userData.getUserID($(star).parent()[0]);
		
		if (userID != null) {
			$(star).parent().attr('curvalue', $(star).children('a').html());
			$.post('./scripts/post.php', {
				'userid': userID,
				'class' : $(star).parent().attr('classid'),
				'rating': $(star).children('a').html()
			});
				
			return false;
		}
		
		logData(["rated", $(star).parent().attr('classid')]);
	},
	
	starOff: function(star) {
		var curValue = $(star).parent().attr('curvalue');
		
		if (curValue != null) {
			this.drain(star);
			this.reset(curValue, star);
		}
	},
	
	cancelOn: function(cancel) {
		this.drain(cancel);
		$(cancel).addClass('on');
	},
	
	cancelClick: function(cancel) {
		this.drain(cancel);
		
		var userID = this.getUserID($(cancel).parent()[0]);
		
		if (userID != null) {
			$(cancel).parent().attr('curvalue', 0);
			$.post('./scripts/post.php', {
				'userid': userID,
				'class' : $(cancel).parent().attr('classid'),
				'rating': '0'
			});
			return false;
		}
		
		logData(["canceled rating", $(star).parent().attr('classid')]);
	},
	
	cancelOff: function(cancel) {
		var curValue = $(cancel).parent().attr('curvalue');
		this.reset(curValue, cancel);
		
		$(cancel).removeClass('on');
	},
	
	enrollUnenroll: function(enrollment) {
		var userID = window.database.getObject("user", "userid");
		
		if (userID != null) {
			if ($(enrollment).text() == "Show me as enrolled!") {
				$(enrollment).text("Disenroll");
				$.post('scripts/post.php', {
					'userid': userID,
					'semester': term + current_year,
					'class' : $(enrollment).attr('id').split("-")[2],
					'enroll': '1'
				});
				
				logData(["enrolled", $(enrollment).attr('id').split("-")[2]]);
			} else {
				$(enrollment).text("Show me as enrolled!");
				$.post('scripts/post.php', {
					'userid': userID,
					'semester': term + current_year,
					'class' : $(enrollment).attr('id').split("-")[2],
					'enroll': '0'
				});
				
				logData(["unenrolled", $(enrollment).attr('id').split("-")[2]]);
			}
		}
	},

	plusOn:  function(anchor) {
		$(anchor).addClass("plusOn");
	},

	plusOff:  function(anchor) {
		$(anchor).removeClass("plusOn");
	},

	plusClick:  function(anchor) {
		if (window.database.getObject('user', 'userid') != null) {
			var commentID = anchor.getAttribute("classid");
		}
		
		var currentVotes = $($(anchor).parents("tr").find(".picker-ratings")[0]);
		var votechange = 0;
		if ($(anchor).parents("tr").find(".plusClicked").length != 0) {
			votechange = -1;
		} else if ($(anchor).parents("tr").find(".minusClicked").length != 0) {
			votechange = 2;
		} else {
			votechange = 1;
		}
		currentVotes.html(parseInt(currentVotes.html()) + votechange);
		$(anchor).parent().find(".ui-icon-minusthick").removeClass("minusClicked");
		
    		$.post("scripts/post.php",
    			{ userid: window.database.getObject('user', 'userid'),
                  plus: true,
    			  commentid: commentID
    			}, 
    			function (data) { $(anchor).toggleClass('plusClicked'); } );
		
		logData(["clickedPlus", commentID]);
        },

	minusOn:  function(anchor) {
		$(anchor).addClass("minusOn");
	},

	minusOff:  function(anchor) {
		$(anchor).removeClass("minusOn");
	},

	minusClick:  function(anchor) {
		if (window.database.getObject('user', 'userid') != null) {
			var commentID = anchor.getAttribute("classid");
		}
		
		var currentVotes = $($(anchor).parents("tr").find(".picker-ratings")[0]);
		var votechange = 0;
		if ($(anchor).parents("tr").find(".minusClicked").length != 0) {
			votechange = 1;
		} else if ($(anchor).parents("tr").find(".plusClicked").length != 0) {
			votechange = -2;
		} else {
			votechange = -1;
		}
		currentVotes.html(parseInt(currentVotes.html()) + votechange);
		$(anchor).parent().find(".ui-icon-plusthick").removeClass("plusClicked");

    		$.post("scripts/post.php",
    			{ userid: window.database.getObject('user', 'userid'),
			  minus: true,
    			  commentid: commentID
    			}, 
    			function (data) { $(anchor).toggleClass('minusClicked'); } );
		
		logData(["clickedMinus", commentID]);
	},

	flagOn:  function(anchor) {
		$(anchor).addClass("flagOn");
	},

	flagOff:  function(anchor) {
		$(anchor).removeClass("flagOn");
	},

	flagClick:  function(anchor) {
		if (window.database.getObject('user', 'userid') != null) {
			var commentID = anchor.getAttribute("classid");
		}
		
    		$.post("scripts/post.php",
    			{ userid: window.database.getObject('user', 'userid'),
			  flag: true,
    			  commentid: commentID
    			}, 
    			function (data) { $(anchor).toggleClass('flagClicked'); } );
		
		logData(["clickedFlag", commentID]);
	}
}
