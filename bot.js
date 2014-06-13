var requestify = require("requestify");
var async = require("async");

// Create an incoming webhook
var slack = require('slack-notify')(process.env.SLACKHOOK);


var matchID = "",
	matchScore = "",
	match;


var cron = require('cron');
var cronJob = cron.job("* * * * * *", function(){


	// Get Match list
	requestify.get('http://live.mobileapp.fifa.com/api/wc/matches').then(function(response) {
	    var matches = response.getBody().data.group;

	    async.filter(matches, function(item, callback) {
	        callback (item.b_Live == true);

	    }, function(results){

            match = results[0];

            if (typeof match == "object") {
            	// Got Live Match!

                  var homeTeamField = 'c_HomeTeam_' + (process.env.LANGUAGE || 'en');
                  var awayTeamField = 'c_AwayTeam_' + (process.env.LANGUAGE || 'en');
            	if (match.n_MatchID != matchID) {
            		// New Match just started

            		matchID = match.n_MatchID;
            		matchScore = ''

            		// Notify New match
            		var text = 'Começa '+match[homeTeamField]+ ' vs '+match[awayTeamField];
            		console.log(text)
            		slack.send({
					  channel: '#' + process.env.CHANNEL,
					  text: text,
					  username: 'WorldCupBot'
					});


            	} else if (matchScore != match.c_Score) {
            		// Different Score

            		matchScore = match.c_Score

            		var text = match[homeTeamField]+ ' '+match.c_Score+' '+match[awayTeamField]+' ';

            		// Notify goal
            		console.log(text)

            		slack.send({
					  channel: '#' + process.env.CHANNEL,
					  text: text,
					  username: 'WorldCupBot'
					});

            	}

            }



	    });

	});
});
cronJob.start();