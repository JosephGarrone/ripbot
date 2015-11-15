var Request = require('request');
var Cheerio = require('cheerio');

var that = this;
var limit = 5;

this.getTimes = function(channel, list) {
    var completed = 0;
    var responses = [];

	channel.send(">!time is not currently implemented");
	return;
	var max = list.length;
	if (list.length > limit) {
		max = limit;
	}		

    for (var i = 0; i < max; i++) {
		(function(index) {
			Request("https://www.google.com.au/search?q=time+in+" + list[index], function(err, res, body) {
				responses[index] = body;
				completed++;
				if (completed == max) {
					var response = "";
					for (var j = 0; j < responses.length; j++) {
						var location = list[index];
						var time = that.getTime(responses[j]);
						response += ">" + location + ": " + time + "\r\n";
					}

					if (list.length > 5) {
						response += ">I am limited to " + limit + " timezones at once.";
					}
					channel.send(response);
				}
			}); 
		}) (i);
    }
}

this.getTime = function(html) {
	var $ = Cheerio.load(html);
	var response = "";

	console.log(html);

	$('div').each(function (i, element) {
		if ($(element).attr("data-hveid") == "28") {
			var container = $(element).children()[0];
			var timezone = $(container).children()[2].text();
			var time = $(container).children()[0].text();
			var date = $(container).children()[1].text();
			console.log(time, date, timezone);
			response = ">" + time + " on " + date + " (" + timezone + ")";
		}
	});

	return response;
}
