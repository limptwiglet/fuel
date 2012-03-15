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
});
