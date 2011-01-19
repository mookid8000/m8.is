var mongo = require('mongodb');
var db;

var assertInitialized = function() {
	if (typeof db == 'undefined') {
		throw new Error('repos has not been properly initialized. Please call .initialize(host, port, db)');
	}	
};

exports.initialize = function(mongodb_host, mongodb_port, database_name) {
	db = new mongo.Db(database_name, new mongo.Server(mongodb_host, mongodb_port, {}), {});
};

exports.insertUrl = function(doc, inserted) {
	assertInitialized();
	
	db.open(function() {
		db.collection('urls', function (err, coll) {
			coll.insert(doc, function() {
				inserted();
			});
		})
	})
};