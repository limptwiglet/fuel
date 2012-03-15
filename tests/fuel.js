var fs = require('fs');
var fuel = require('../fuel');
var expect = require('chai').expect;


describe('Fuel', function () {
	describe('#Constructor', function () {
		var f = fuel('./', {});
	
		it('should have a path', function () {
			expect(f).to.have.property('path');
		});

		it('should have config', function () {
			expect(f).to.have.property('config');
		});
	});


	describe('#Config', function () {
		var f = fuel('./', {});

		it('should find a config', function (done) {
			f._getConfig('../', function (conf) {
				done();
			});
		});

		it('should return a config object', function () {
			f._getConfig('../', function (conf) {
				expect(conf).to.be.a('object');
				done();
			});
		});
	});


	describe('#Build', function () {
		var appDir = '../testApp/';
		var f = fuel(appDir, {});
		var deps = [
			'http://code.jquery.com/jquery-1.7.1.js',
			'http://cloud.github.com/downloads/emberjs/ember.js/ember-0.9.5.js'
		];

		it('should get application dependancies', function (done) {
			f._getDependancies(deps, function (depFiles) {
				exepct(depFiles.length).to.equal(deps.length);
				done();
			});	
		});
		
		// Destroy any existing build directory
		before(function(done) {
			fs.unlink(appDir + 'build', function (err) {
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
