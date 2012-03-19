var fs = require('fs');
var fuel = require('../fuel');
var expect = require('chai').expect;


describe('Fuel', function () {
	var appPath = './exampleApp/';

	describe('Constructor', function () {
		var f = fuel('./', {});
	
		it('should have a path', function () {
			expect(f).to.have.property('path');
		});

		it('should have config', function () {
			expect(f).to.have.property('config');
		});
	});


	describe('_getConfig', function () {
		var f = fuel('./', {});

		it('should not find a config', function (done) {
			f._getConfig('../', function (err, conf) {
				expect(err).to.exist;
				done();
			});
		});

		it('should find a config', function (done) {
			f._getConfig(appPath, function (err, conf) {
				expect(err).to.not.exist;
				done();
			});
		});

		it('should return a config object', function (done) {
			f._getConfig(appPath, function (err, conf) {
				expect(conf).to.be.ok;
				done();
			});
		});
	});


	describe('build', function () {
		var f = fuel(appPath, {});

		it('should fetch hosted dependancies', function (done) {
			f._getDependancies(['http://code.jquery.com/jquery-1.7.1.js'], function (depFiles) {
				expect(depFiles).to.have.length(1);
				done();
			});	
		});


		it('should fetch local dependancies', function (done) {
			f._getDependancies([appPath + 'main.js'], function (depFiles) {
				expect(depFiles).to.have.length(1);
				done();
			});
		});


		it('should create build dir', function (done) {
			f._makeBuildDir(appDir, function () {
				var stat = fs.statSync(appDir + 'build')  
				expect(stat.isDirectory()).to.be.true;
				done();
			});
		});


		it('should build a directory', function (done) {
		
		});

		it('should output application files to build dir', function (done) {
			f.build(appDir, function () {
				fs.readdir(appDir + 'build', function (err, files) {
					expect(err).to.not.be.ok;
					expect(files.indexOf('app.js')).to.be.above(-1);
				});
			});
		});
	});
});
