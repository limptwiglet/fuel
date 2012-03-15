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

function Fuel (path, config) {
	this.path = path;
	this.config = config || this._getConfig(path);
}

Fuel.p = Fuel.prototype;

Fuel.p.build = function () {

}

Fuel.p._getConfig = function () {

}


module.exports = function (path, options) {
	return new Fuel(path, options);
};
