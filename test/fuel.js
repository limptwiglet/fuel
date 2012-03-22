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






	describe('_makeBuildDir', function () {
		var f = fuel('./', {});

		after(function (done) {
			fs.rmdir(appPath + 'build', function () {
				done();	
			});
		});

		it('should create build dir', function (done) {
			f._makeBuildDir(appPath, function () {
				var stat = fs.statSync(appPath + 'build');
				expect(stat.isDirectory()).to.be.true;
				done();
			});
		});


		before(function (done) {
			f._makeBuildDir(appPath, function () {
				fs.writeFile(appPath + 'build/test.txt', '', 'utf-8', function () {
					done();	
				});
			});
		});

		after(function (done) {
			fs.unlink(appPath + 'build/test.txt', function () {
				fs.rmdir(appPath + 'build', function () {
					done();
				});
			});
		});

		it('should NOT wipeout existing build dir', function (done) {
			f._makeBuildDir(appPath, function () {
				fs.stat(appPath + 'build/test.txt', function (err, stats) {
					expect(err).to.not.exist;
					expect(stats.isFile()).to.be.true;
					done();
				});
			});
		});
	});


	describe('build', function () {
		var f = fuel('../', {});
		it('should add setup.js to top and init.js to bottom', function (done) {
			f.build('./exampleApp/', function () {
				done();	
			});
		});
	});
});
