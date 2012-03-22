var build = require('../lib/build');
var fs = require('fs');
var fuel = require('../fuel');
var expect = require('chai').expect;


var appPath = './exampleApp/';

describe('build tool', function () {
	describe('getConfig', function () {
		it('should not find a config', function (done) {
			build.getConfig('../', function (err, conf) {
				expect(err).to.exist;
				expect(conf).to.not.exist;
				done();
			});
		});

		it('should find a config', function (done) {
			build.getConfig(appPath, function (err, conf) {
				expect(err).to.not.exist;
				expect(conf).to.exist;
				done();
			});
		});

		it('should return a config object', function (done) {
			build.getConfig(appPath, function (err, conf) {
				expect(conf).to.be.ok;
				done();
			});
		});
	});


	describe('getFiles', function () {
		it('should get hosted files', function (done) {
			build.getFiles(['http://code.jquery.com/jquery-1.7.1.js'], function (depFiles) {
				expect(depFiles).to.have.length(1);
				done();
			});	
		});


		it('should get local files', function (done) {
			build.getFiles([appPath + 'setup.js'], function (depFiles) {
				expect(depFiles).to.have.length(1);
				done();
			});
		});
	});

	describe('buildFile', function () {
		it('should accept file type and file data', function (done) {
			build.buildFile({
				type: 'javascript',
				data: '{}'
			}, function (err, file) {
				expect(err).to.not.exist;
				expect(file).to.be.a('string');
				done();
			});
		});

		it('should throw an error on unhandable file types', function (done) {
			build.buildFile({
				type: 'adfadsfadsf',
				data: '{}'
			}, function (err, file) {
				expect(err).to.exist;	
				expect(file).to.not.exist;
				done();
			});
		});

		it('should call _getFiles to get paths', function () {
			build.buildFile({
				type: 'javascript',
				path: appPath + 'main.js'
			}, function (err, file) {
				expect(err).to.not.exist;	
				expect(file).to.be.a('string');
				done();
			});
		});

		it('should wrap template files', function (done) {
			build.buildFile({
				type: 'html',
				fileName: 'test',
				data: '<div id=""></div>'
			}, function (err, file) {
				expect(err).to.not.exist;	
				expect(file).to.be.a('string');
				expect(file).to.match(/^Ember\.TEMPLATES\[\'test\'\] \= Ember\.Handlebars\.compile\(".+"\);$/);
				done();
			});
		});

	});
});
