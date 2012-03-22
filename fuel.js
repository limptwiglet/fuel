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
	this.buildDirectory(path, cb);
}

// Given a path it will build any files at the location based on its config
// It will output files in this order:
// - setup.js - Setup application namespace (Optional for sub-modules)
// - dirs/ - Run through each directory building it
// - init.js - Initializes the app/sub-module






module.exports = function (path, options) {
	return new Fuel(path, options);
};
