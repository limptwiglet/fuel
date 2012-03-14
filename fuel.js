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


// Takes a path and builds the file tree at the path
function build (path) {
	var files = []; // Will contain our file contents

	// First we need to get the apps dependancies
	getDeps(function (deps) {
		files.push(deps);

		// First get the app.js file contents
		getFile(path + '/app.js', function (file) {
			files.push(file);

			getAppFiles(path, function (appFiles) {
				getFile(path + '/main.js', function (file) {
					files.push(file);

				});
			});
		});

	});
}


function getConfig (path, cb) {
	
}


function getFile (path, cb) {
	fs.readFile(path, 'utf-8', function (err, data) {
		if (err) throw err;

		cb(data);
	});
}


// Checks if a file is a valid application file by checking its extension and
// isnt a application core fie ie app.js, main.js
function isAppFile (file) {
	if (!ACCEPT_EXT.test(file)) return false;

	if (!/app\.js|main\.js/.test(file)) return false;

	return true;
}


// Returns application files within the passed in directory
function getAppFiles (path, cb) {
	var files = [];
	path = path + '/';

	// Read dir to get a files list
	fs.readdir(path, function (err, files) {
		if (err) throw err;

		var count = files.length;
		var done = 0;

		// Add done is called every time a file dosnt pass checking or is
		// returned correctly and triggers the callback
		var addDone = function () {
			done++;

			if (done >= count) {
				cb(files);
			}
		};

		// If the directory contains files continue else all addDone
		if (files.length > 0) {

			files.forEach(function (file) {
				var isDir = file.indexOf('.') == -1;

				// Is an accepted file or possibly a directory
				if (isAppFile(file) || isDir) {
					fs.stat(path + file, function (err, stats) {
						if (err) throw err;

						if (stats.isFile())	{
							fs.readFile(path + file, 'utf-8', function (err, data) {
								if (err) throw err;	
								files.push(data);
								addDone();
							});
						} else if (stats.isDirectory()) {
							getAppFiles(path + file, function (f) {
								files.concat(f);
								addDone();
							});
						}
					});
				} else {
					addDone();
				}
			});
		} else {
			addDone();
		}
	});
}


// Returns application dependancies
function getDeps (cb) {
	var deps = [];
	var count = 0;
	var done = 0;

	console.log('Fetching dependancies:');
	for (var k in DEPS) {
		(function (k, v) {
			v = url.parse(v);
			console.log('\tFetching -', k);
			var req = http.request({
				host: v.hostname,
				path: v.pathname
			}, function (res) {
				res.setEncoding('utf-8');
				res.on('data', function (chunk) {
					deps.push(chunk);
				});

				res.on('end', function () {
					done++;

					if (done >= count) {
						console.log('Dependancies ✔');
						cb(deps.join(''));
					}
				});
			});

			req.end();
		})(k, DEPS[k]);

		count++;
	}
}
