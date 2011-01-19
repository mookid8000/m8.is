var server_port = 8000;

var mongodb_host = 'localhost',
	mongodb_port = 27017,
	mongodb_db_name = 'm8_development';

var express = require('express');
var util = require('util');
var repos = require('./repos');

repos.initialize(mongodb_host, mongodb_port, mongodb_db_name);

var app = express.createServer();

var dump = function(obj) {
	console.log(util.inspect(obj, false, null));
}

app.configure(function() {
	app.set('view engine', 'haml');

	app.use(express.staticProvider(__dirname + '/public'));
	app.use(express.bodyDecoder());
	app.use(express.cookieDecoder());
	app.use(express.session());
});

app.get('/', function(req, res) {
	res.render('index', {locals: {flash: req.flash()}});
});

app.post('/shortify', function(req, res) {
	var body = req.body;
	var url = body['url'];
	
	var doc = {
		url: url,
	};

	repos.insertUrl(doc, function() {
		req.flash('info', 'URL _%s_ is saved...', url);
		res.redirect('back');
	});
});

console.log("Listening on port " + server_port + "...");

app.listen(server_port);