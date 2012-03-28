/**
 * Fuel server
 * The fuel server help develop ember applications allowing for easier debugging 
 * by putting up a development server that injects any application files and 
 * dependancies on the fly, it also allows for proxying to another server
 *
 * @param - {Object} - Config object for starting the server:
 *	{
 *		path: {String} - Path to application files
 *		proxy: {String} - Proxy calls to this host ie 'http://host:port/path'
 *	}
 * 
 */
var fs = require('fs');
var utils = require('./utils');
var url = require('url');
var connect = require('connect');


exports = module.exports = createServer;

var CONFIG = {
	host: 'localhost',
	port: 3000,
	path: process.env.PWD,
	proxy: false
};

/**
 * Runs a development server that will compile assets when new requests come in
 */
function createServer (config) {
	config = utils.merge(CONFIG, config);

	var app = connect();
		app.use(connect.logger('dev'));
		app.use(connect.static(config.path));
		app.use(handlers(config));


	app.listen(config.port);
	
	return app;
}


function handlers (config) {
	if (config.proxy) {
		return proxyHandler;
	} else {
		return function (req, res, next) {
			fs.readFile(config.path + '/index.html', 'utf8', function (err, data) {
				res.end(data);
			});
		};
	}
}
