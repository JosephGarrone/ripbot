var Request = require('request');
var Cheerio = require('cheerio');

var that = this;
var limit = 5;

this.getAcronyms = function(channel, list) {
    var completed = 0;
    var responses = [];

	var max = list.length;
	if (list.length > limit) {
		max = limit;
	}		

	if (list.length == 1 && (list[0].toLowerCase() == ":horse:" || list[0] == "horse")) {
		channel.send(">:taco:");
		return;
	}

    for (var i = 0; i < max; i++) {
		(function(index) {
			Request("http://acronyms.thefreedictionary.com/" + list[index], function(err, res, body) {
				responses[index] = body;
				completed++;
				if (completed == max) {
					var response = "";
					for (var j = 0; j < responses.length; j++) {
						var acro = that.getAcronymTitle(responses[j])
						var acronym = that.getAcronym(responses[j]);
						response += ">" + acro + ": " + acronym + "\r\n";
					}

					if (list.length > 5) {
						response += ">I am limited to " + limit + " acronyms at once.";
					}
					channel.send(response);
				}
			}); 
		}) (i, list[i]);
    }
}

this.getAcronym = function(html) {
	var $ = Cheerio.load(html);
	var responses = [];

	$('td.acr').each(function (i, element) {
		responses.push($(element).siblings().text());
	});

	return responses[Math.floor(Math.random() * responses.length)];
}

this.getAcronymTitle = function(html) {
	var $ = Cheerio.load(html);
	
	return $('title').text().split("-")[0].trim().toUpperCase();
}
