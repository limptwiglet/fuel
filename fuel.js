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


var FILE_HANDLER = {
	'javascript': function (opts, file) {
		return file;	
	},

	'html': function (opts, file) {
		file = file.replace(/"/g, '\\"');
		file = file.replace(/(\r\n|[\r\n])/g, '');
		
		file = 'Ember.TEMPLATES[\'' + opts.fileName + '\'] = Ember.Handlebars.compile("' + file + '");';

		return file;	
	}
};


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
	this.buildDirectory(path, cb);
}

// Given a path it will build any files at the location based on its config
// It will output files in this order:
// - setup.js - Setup application namespace (Optional for sub-modules)
// - dirs/ - Run through each directory building it
// - init.js - Initializes the app/sub-module
Fuel.p.buildDirectory = function (path, cb) {
	var _this = this;

	this._getConfig(path, function (err, config) {
		var total = 0;
		var dirs = [];
		var files = [];
		var processedFiles = [];

		var processPaths = function () {
			dirs.forEach(function (dir, i) {
				_this.buildDirectory(path + dir);
			});

			files.forEach(function (file, i) {
				_this._buildFile(path + file, function (err, data) {
				});
			});
		};

		fs.readdir(path, function (err, dirFiles) {
			if (err) throw err;
			total = dirFiles.length;

			dirFiles.forEach(function (dirFile, i) {
				fs.stat(path + dirFile, function (err, stat) {
					if (err) throw err;

					if (stat.isFile()) {
						if (dirFile === 'setup.js') {
							files.splice(0, 0, dirFile);
						} else if (dirFile === 'init.js') {
							files.push(dirFile)
						} else {
							files.splice(-1, 0, dirFile);
						}
					} else if (stat.isDirectory()) {
						dirs.push(dirFile);
					} else {
						total--;	
					}

					if (dirs.length + files.length >= total) {
						processPaths();
					}
				});
			});
		});
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

Fuel.p._buildFile = function (opts, cb) {
	var type = opts.type;
	var data = opts.data;

	if (type && data) {
		if (FILE_HANDLER[type]) {
			cb(null, FILE_HANDLER[type](opts, data));
		} else {
			cb(new Error('No handler for '+ type));
		}
	}
}

Fuel.p._getFiles = function (filePaths, cb) {
	var done = 0;
	var files = [];

	var fileDone = function (file, i) {
		files[i] = file;
		done++;

		if (done >= filePaths.length) {
			cb(files);
		}
	};

	filePaths.forEach(function (file, i) {
		if (/^[http|https]/.test(file)) {
			var data = '';
			file = url.parse(file);

			var req = http.request({
				host: file.host,
				path: file.path,
				method: 'GET'
			}, function (res) {
				res.setEncoding('utf8');
				res.on('data', function (chunk) {
					data+= chunk;
				})

				res.on('end', function () {
					fileDone(data, i);
				});
			});

			req.end();
		} else {
			fs.readFile(file, 'utf-8', function (err, data) {
				if (err) throw err;

				fileDone(data, i);
			});
		}
	});
}

// Makes a build directory at the give path unless one
// already exists
Fuel.p._makeBuildDir = function (path, cb) {
		// First check that the build dir dosnt already exist
		fs.stat(path + 'build', function (err, stat) {
				if (err) {
						fs.mkdir(path + 'build', cb);
				} else {
						cb();
				}
		});
}


module.exports = function (path, options) {
	return new Fuel(path, options);
};
