// Global includes
var Slack = require('slack-client');

// Local includes
var acronym = require('./acronym.js');
var time = require('./time.js');
var stats = require('./stats.js');
var secure = require('./secure.js');

var slackToken = secure.slack.token;
var autoReconnect = true;
var autoMark = true;

var testing = false; 
var permittedUsers = ["@rip", "@trm"];

slack = new Slack(slackToken, autoReconnect, autoMark);

slack.on('open', function() {
	console.log("Connected to " + slack.team.name + " as @" + slack.self.name);
});

slack.on('message', function(message) {
	var channel = slack.getChannelGroupOrDMByID(message.channel);
	var user = slack.getUserByID(message.user);
	var text = message.text;
	var type = message.type;
	var userName = (user != null ? user.name : void 0) != null ? "@" + user.name : "unknown_user";
	
	if (type === 'message' && text != null && channel != null && !user.is_bot && text.substring(0, 1) == "!") {
		if (testing) {
			if (permittedUsers.indexOf(userName) > -1) {
				sendResponse(channel, message);
			}
		} else {
			sendResponse(channel, message);
		}
	} else if (type === 'message' && text != null && channel != null && !user.is_bot && text.substring(0, 1) != "!") {
		stats.storeStats(message, channel.name, userName);
	}
});

slack.on('error', function(err) {
	console.error("Error", err);
});

slack.login();

function sendResponse(channel, message) {
	var text = message.text;
	var info = getInfo(text);
	var type = info.type;
	var data = info.data;

	switch (type) {
		case "acro":
			acronym.getAcronyms(channel, data);
			break;
		case "time":
			time.getTimes(channel, data);
			break;
		case "about":
			showAbout(channel);
			break;
		case "help":
			showHelp(channel, data);
			break;
		case "masterrace":
			channel.send(slack.self.name + " is the best.");
			break;
		case "stats":
			stats.getStats(channel);
			break;
		case "unknown":
		default:
			channel.send("I don't know how to interpret that.");
	}
}

function getInfo(text) {
	var type = "unknown";
	var data = [];

	// Match for "!acro {thing1} {thing2} ... {thingN}"	
	if (startsWith(text, "!acro")) { 
		type = "acro";
		data = getArgs(text.substring("!acro ".length));
	}	

	// Match for "!time {thing1} {thing2} ... {thingN}"
	if (startsWith(text, "!time")) {
		type = "time";
		data = getArgs(text.substring("!time ".length));
	}

	// Match for "!about"
	if (startsWith(text, "!about")) {
		type = "about"
	}

	// Match for "!masterrace"
	if (startsWith(text, "!masterrace")) {
		type = "masterrace";
	}

 	// Match for "!help"
	if (startsWith(text, "!help")) {
		type = "help";
		data = getArgs(text.substring("!help ".length));
	}

	// Match for "!stats"
	if (startsWith(text, "!stats")) {
		type = "stats";
	}

	return {
		type: type,
		data: data
	};
}

function getArgs(text) {
	text = text.replace(/[\n\r]+/g, " ");
	return text.trim().split(" ");
}

/* Help and About functions */
function showAbout(channel) {
	var response = "";

	response += ">I am a bot made by Rip.\r\n";
	response += ">I provide information on demand.\r\n";
	response += ">Find out more by typing !help\r\n";
	
	channel.send(response);
}

function showHelp(channel, data) {
	var response = "";

	if (data.length == 0 || true) {
		response += ">Usage: !{command} {arg1} {arg2} ... {argN}\r\n";
		response += ">Available commands: !acro, !time, !about, !help, !masterrace, !stats";
	} else {
		
	}

	channel.send(response);
}

/* Utilities */
function startsWith(string, prefix) {
	return string.slice(0, prefix.length) == prefix;
}
