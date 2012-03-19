/*
 *	Project folder structure
 *
 *	- config.json (Contains build information)
 *	- app.js (Sets up our application namespace and any global settings)
 *	- main.js (This initaliazes the application)
 *	- models/ (Contains our application models)
 *	- templates/ (Contains our application templates)
 *	- modules/ (Contains modules that are contained blocks of functionality)
 *		- MODULE_NAME/
 *			- models/ (Module specific models)
 *
 */
var fs = require('fs');
var http = require('http');
var url = require('url');

var args = process.argv.slice(2);
var path = '.';

var ACCEPT_EXT = /(\.js|html|handlebars)$/;


if (args[0] === 'build') {
	build(path);
}

// Fuel constructor function
function Fuel (path, config) {
	this.path = path;
	this.config = config || this._getConfig(path);
}

// Prototype shortcut
Fuel.p = Fuel.prototype;


// Build will take an application path and build any
// assets it finds at the location and output the files
// to the build diretory
Fuel.p.build = function (path, cb) {
}

// Given a path it will build any files at the location based on its config
Fuel.p.buildDirectory = function (path, cb) {
	this._getConfig(path, function () {

	});
}

// Should return a config file from the passed in directory
Fuel.p._getConfig = function (path, cb) {
	fs.readFile(path + 'config.json', 'utf-8', function (err, data) {
		if (!err) {
			data = JSON.parse(data);
		}

		cb(err, data);
	});
}

Fuel.p._getDependancies = function (depPaths, cb) {
	var done = 0;
	var deps = [];

	var depDone = function (file, i) {
		deps[i] = file;
		done++;

		if (done >= depPaths.length) {
			cb(deps);
		}
	};

	depPaths.forEach(function (dep, i) {
		if (/^[http|https]/.test(dep)) {
			var file = '';
			dep = url.parse(dep);

			var req = http.request({
				host: dep.host,
				path: dep.path,
				method: 'GET'
			}, function (res) {
				res.setEncoding('utf8');
				res.on('data', function (data) {
					file+= data;
				})

				res.on('end', function () {
					depDone(file, i);
				});
			});

			req.end();
		} else {
			fs.readFile(dep, 'utf-8', function (err, data) {
				if (err) throw err;

				depDone(data, i);
			});
		}
	});
}

// Makes a build directory at the give path unless one
// already exists
Fuel.p._makeBuildDir = function (path, cb) {

}


module.exports = function (path, options) {
	return new Fuel(path, options);
};
