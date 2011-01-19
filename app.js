String.prototype.startsWith = function(str) 
{
	return (this.match("^"+str) == str);
}

var server_port = 8164;

var base_url = 'http://localhost:' + server_port;

var mongodb_host = 'localhost',
	mongodb_port = 27017,
	mongodb_db_name = 'm8_development';

var express = require('express');

var app2 = express.createServer();
app2.get('/', function(req, res) {
	res.render('index');
});
app2.listen(server_port);



