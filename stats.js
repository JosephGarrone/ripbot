var Request = require('request');
var Mysql = require('mysql');

var secure = require('./secure.js');

var that = this;
var connection = Mysql.createConnection({
	host: "localhost",
	user: "slack",
	password: secure.mysql.password,
	database: "slack"
});
connection.connect(function(err) {
	if (err != null) {
		console.error(err);
	}
});

this.storeStats = function(message, channel, user) {
	var words = message.text.replace(/[\n\r]+/g, " ");
	words = words.trim().split(" ");
	
	for (var i = 0; i < words.length; i++) {
		words[i] = words[i].replace(/\W/g, "");
		if (words[i].length >= 4) {
			this.storeWord(words[i], channel, user);
		}
	}
}

this.storeWord = function(word, channel, user) {
	connection.query("SELECT `id`, `count` FROM `words` WHERE `word` = ? AND `channel` = ?", [word, channel], function(err, results, fields) {
		var id = 0;
		var count = 0;
		if (results && results.length > 0) {
			id = results[0].id;
			count = results[0].count;
		}
		
		count++;

		connection.query("INSERT INTO `words` (`id`, `word`, `count`, `channel`, `last`) VALUES (?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE `word`=VALUES(`word`), `count`=VALUES(`count`), `channel`=VALUES(`channel`), `last`=VALUES(`last`)", [id, word, count, channel, user], function(err, results, fields) {
			if (err)
				console.error(err);
		});
	});	
}

this.getStats = function(channel) {
	var response = "";

	connection.query("SELECT `word`, `count`, `channel`, IFNULL(`last`, 'unknown') as `last` FROM `words` WHERE 1 ORDER BY `count` DESC LIMIT 10", function(err, results, fields) {
		if (err) 
			console.error(err);

		response += ">Top 5 most used words in any channel\r\n";
		for (var i = 0; i < results.length; i++) {
			response += ">    *" + results[i].word + "* with *" + results[i].count + (results[i].count > 1 ? "* uses": "* use") + " in _" + results[i].channel + "_, last used by " + results[i].last + "\r\n";
		}		

		channel.send(response);
	});
}
