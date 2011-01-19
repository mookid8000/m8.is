String.prototype.startsWith = function(str) 
{
	return (this.match("^"+str) == str);
}

var args = process.argv;

/* Settings ------------------------------------------- */

var server_port = args[2] ? parseInt(args[2]) : 8000;
var server_host = args[3] ? args[3] : 'localhost';

var mongodb_host = args[4] ? args[4] : 'localhost',
	mongodb_port = args[5] ? parseInt(args[5]) : 27017,
	mongodb_db_name = args[6] ? args[6] : 'm8_development',
	mongodb_user = args[7] ? args[7] : null,
	mongodb_pwd = args[8] ? args[8] : null;

/* ---------------------------------------------------- */

var util = require('util');
var repos = require('./modules/repos');
var md5 = require('./modules/md5')
var connect_mongodb = require('connect-mongodb');
var express = require('express');

var base_url = 'http://' + server_host + ':' + server_port;

console.log('Configured base URL: ' + base_url);

var app = express.createServer();

var dump = function(obj) {
	console.log(util.inspect(obj, false, null));
}

app.configure(function() {
	app.set('view engine', 'haml');
	app.use(express.staticProvider(__dirname + '/public'));
	app.use(express.bodyDecoder());
	app.use(express.cookieDecoder());
	
	var mongodb_session_store_config = function() {
		var obj = {
			dbname: mongodb_db_name,
			host: mongodb_host,
			port: mongodb_port
		};
		
		if (mongodb_user) {
			obj.username = mongodb_user;
			obj.password = mongodb_pwd;
		}
		
		return {
			store: connect_mongodb(obj)
		};
	};
	
	app.use(express.session(mongodb_session_store_config()));
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
		
		session.state.urls.push({url: url, link: base_url + '/r/' + key});
		
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

repos.initialize(mongodb_host, mongodb_port, mongodb_db_name, mongodb_user, mongodb_pwd, function() {
	console.log('Initialized MongoDB (' + mongodb_host + ':' + mongodb_port + '/' + mongodb_db_name + ')');

	app.listen(server_port);
	console.log("Listening on port " + server_port + "...");
});
