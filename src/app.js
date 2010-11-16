var server_port = 8000;

var mongodb_host = 'localhost',
	mongodb_port = 27017,
	mongodb_db_name = 'm8_development';

var mongo = require('mongodb');
var express = require('express');

var app = express.createServer();

app.configure(function() {
	app.set('view engine', 'hamljs');

	app.use(express.staticProvider(__dirname + '/public'));
	app.use(express.bodyDecoder());
});

db = new mongo.Db(mongodb_db_name, new mongo.Server(mongodb_host, mongodb_port, {}), {});

app.get('/', function(req, res) {
	res.render('index');
});

app.post('/shortify', function(req, res) {
	var url = req.body['url'];
	console.log('url: ' + url);
	
	var doc = {
		url: url,
	};
	
	db.open(function() {
		db.collection('urls', function (err, coll) {
			coll.insert(doc, function() {
				res.redirect('back');
			});
		})
	})
});

console.log("Listening...");

app.listen(server_port);