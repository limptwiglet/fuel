/**
 * Module dependencies
 */
var fs = require('fs');
var	url = require('url');
var	http = require('http');


/**
 * Build namespace
 */

var build = exports = module.exports = {};


var FILE_TYPES = {
	JSON: 0,
	JS: 1,
	HTML: 2
};


/**
 * File type handlers are functions that run on different files types such as
 * templates adding template names etc
 */

var FILE_HANDLERS = {
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


/*
 * Return a JSON config file
 */

build.getConfig = function (path, cb) {
	fs.readFile(path + 'config.json', 'utf-8', function (err, data) {
		if (!err) {
			data = JSON.parse(data);
		}

		cb(err, data);
	});
}


/**
 * Returns files from local or hosted paths
 *
 * @param {Array} filePaths
 */

build.getFiles = function (filePaths, cb) {
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


/**
 * Creates a build directory at the passed in location without wiping any
 * existing directories
 *
 * @param {String} path
 */

build.makeBuildDir = function (path, cb) {
	// First check that the build dir dosnt already exist
	fs.stat(path + 'build', function (err, stat) {
		if (err) {
			fs.mkdir(path + 'build', cb);
		} else {
			cb();
		}
	});
}


/**
 * Takes the contents of a file and runs a build function based on
 * the type of file
 */

build.buildFile = function (path, cb) {
	var fileType = getFileType(path);

	if (fileType === null) {
		cb(new Error('Invalid file extension'));
		return;
	}

	fs.readFile(path, 'utf-8', function (err, data) {
		if (err) {
			cb(err);
			return;
		}

		cb(null, data);
	});
}


/**
 * Builds a directory of application files recursivley and returns the built
 * application based on its config and the config files of its submodules
 *
 * @param {String} path
 * @param {Function} cb
 */

build.buildDirectory = function (path, cb) {
	build.getConfig(path, function (err, config) {
		var files = []; // File paths to process
		var dirs = []; // Directory paths to process
		var out = []; // Files and directories that have been process

		// Processes any collected paths
		var processPaths = function () {
			var done = files.length + dirs.length;

			var itemDone = function () {
				if (--done <= 0) {
					out.splice(1, 0, dirs.join(''));
					cb(null, out.join(''));
				}
			};

			dirs.forEach(function (dir, i) {
				build.buildDirectory(path + dir + '/', function (err, data) {
					dirs[i] = data;
					itemDone();
				});
			});

			files.forEach(function (file, i) {
				build.buildFile(path + file, function (err, data) {
					out[i] = data;

					itemDone();
				});
			});
		};

		fs.readdir(path, function (err, dirFiles) {
			if (err) throw err;

			var total = dirFiles.length;

			dirFiles.forEach(function (dirFile, i) {
				fs.stat(path + dirFile, function (err, stat) {
					if (err) throw err;

					if (stat.isFile()) {
						if (dirFile !== 'config.json' && getFileType(dirFile) !== null) {
							if (dirFile === 'setup.js') {
								files.splice(0, 0, dirFile);
							} else if (dirFile === 'init.js') {
								files.push(dirFile)
							} else {
								files.splice(-1, 0, dirFile);
							}
						}
					} else if (stat.isDirectory()) {
						dirs.push(dirFile);
					}

					if (--total <= 0) {
						processPaths();
					}
				});
			});
		});
	});
}



/**
 * Gets the file type based on the extension
 */
function getFileType (path) {
	if (/\.html|handlebars$/.test(path)) {
		return FILE_TYPES.HTML;
	}

	if (/\.js$/.test(path)) {
		return FILE_TYPES.JS;
	}

	if (/\.json/.test(path)) {
		return FILE_TYPES.JSON;
	}

	return null;
}
