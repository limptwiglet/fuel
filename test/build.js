var build = require('../lib/build');
var fs = require('fs');
var fuel = require('../fuel');
var expect = require('chai').expect;


var appPath = './exampleApp/';

describe('build', function () {
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
		it('should throw an error if no file found', function (done) {
			build.buildFile('./bur.js', function (err, file) {
				expect(err).to.exist;	
				done();
			});
		});

		it('should throw and error if the file cannot be built', function (done) {
			build.buildFile('./bur.flanger', function (err, file) {
				expect(err).to.exist;
				expect(err.message).to.equal('Invalid file extension');
				done();
			});
		});
	});


	describe('buildDirectory', function () {
		it('should top and tail output with setup.js and init.js', function (done) {
			build.buildDirectory({
				path: './exampleApp/'
			});
			build.buildDirectory('./exampleApp/', function (err, data) {
				data = data.replace(/\n/g, '');
				expect(err).to.not.exist;
				done();
			});
		});
	});
});
