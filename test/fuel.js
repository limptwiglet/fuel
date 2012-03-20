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


	describe('_getFiles', function () {
		var f = fuel(appPath, {});

		it('should get hosted files', function (done) {
			f._getFiles(['http://code.jquery.com/jquery-1.7.1.js'], function (depFiles) {
				expect(depFiles).to.have.length(1);
				done();
			});	
		});


		it('should get local files', function (done) {
			f._getFiles([appPath + 'main.js'], function (depFiles) {
				expect(depFiles).to.have.length(1);
				done();
			});
		});
	});

	describe('_buildFile', function () {
		var f = fuel('./', {});

		it('should accept file type and file data', function (done) {
			f._buildFile({
				type: 'javascript',
				data: '{}'
			}, function (err, file) {
				expect(err).to.not.exist;
				expect(file).to.be.a('string');
				done();
			});
		});

		it('should throw an error on unhandable file types', function (done) {
			f._buildFile({
				type: 'adfadsfadsf',
				data: '{}'
			}, function (err, file) {
				expect(err).to.exist;	
				expect(file).to.not.exist;
				done();
			});
		});

		it('should call _getFiles to get paths', function () {
			f._buildFile({
				type: 'javascript',
				path: appPath + 'main.js'
			}, function (err, file) {
				expect(err).to.not.exist;	
				expect(file).to.be.a('string');
				done();
			});
		});

		it('should wrap template files', function (done) {
			f._buildFile({
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


		it('should output application files to build dir', function (done) {
			f.build(appPath, function () {
				fs.readdir(appDir + 'build', function (err, files) {
					expect(err).to.not.be.ok;
					expect(files.indexOf('app.js')).to.be.above(-1);
				});
			});
		});
	});
});
