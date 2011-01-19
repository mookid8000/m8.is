var mongo = require('mongodb');
var util = require('util');
var db;

var assertInitialized = function() {
	if (typeof db == 'undefined') {
		throw new Error('repos has not been properly initialized. Please call .initialize(host, port, db)');
	}	
};

exports.initialize = function(mongodb_host, mongodb_port, database_name, username, password, initialized) {
	var server = new mongo.Server(mongodb_host, mongodb_port, {auto_reconnect: true});
	db = new mongo.Db(database_name, server, {});

	db.addListener("error", function(err) { 
		console.log(err);
	}); 

	db.open(function(err) {
		if (!username) {
			initialized();
		}
		else {
			db.authenticate(username, password, function(err) {
				initialized();
			});
	 	}
	});
};

exports.insert = function(doc, inserted, onError) {
	assertInitialized();
	
	db.collection('urls', function (err, coll) {
		if (err) {
			onError(err);
		}
		else {
			coll.insert(doc, function() {
				inserted();
			});
		}
	})
};

exports.getByKey = function(key, gotten, notGotten) {
	assertInitialized();
	
	db.collection('urls', function (err, coll) {
		coll.findOne({k: key}, function(err, doc) {
			if (typeof doc == 'undefined') {
				notGotten();
			}
			else {
				gotten(doc.url);
			}
		});
	})
};