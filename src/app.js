String.prototype.startsWith = function(str) 
{
	return (this.match("^"+str) == str);
}

var server_port = 8000;

var mongodb_host = 'localhost',
	mongodb_port = 27017,
	mongodb_db_name = 'm8_development';

var express = require('express');
var util = require('util');
var repos = require('./repos');
var md5 = require('./md5')

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
	res.render('index', {locals: {
		flash: req.flash(), 
		urls: req.session.state ? req.session.state.urls.slice().reverse() : []
	}});
});

app.post('/shortify', function(req, res) {
	var body = req.body;
	var url = body.url;
	
	if (!(url.startsWith('http://') || url.startsWith('https://'))) {
		url = 'http://' + url;
	}
	
	var key = md5.generate(url);
	
	var doc = {
		url: url,
		_id: key
	};

	repos.insert(doc, function() {
		req.flash('info', 'URL _%s_ has been shortified...', url);
		
		var session = req.session;
		
		if (!session.state) session.state = {created: new Date(), urls: []};
		
		session.state.urls.push({url: url, link: 'http://localhost:' + server_port + '/r/' + key});
		
		res.redirect('back');
	});
});

app.get('/r/:key', function(req, res) {
	var key = req.params.key;
	
	repos.getByKey(key, function(url) {
		res.redirect(url);
	}, function() {
		req.flash('error', 'Could not find shortified url for _%s_', key)
		res.redirect('home')
	});
});

console.log("Listening on port " + server_port + "...");

app.listen(server_port);