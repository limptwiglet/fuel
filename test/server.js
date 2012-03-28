var fs = require('fs');
var server = require('../lib/server');
var expect = require('chai').expect;
var http = require('http');
var connect = require('connect');

describe('Server', function () {

	before(function (done) {
		fs.writeFile('./index.html', 'foo', 'utf8', function () {
			done();
		});
	});

	after(function (done) {
		fs.unlink('./index.html', function () {
			done();
		});
	});

	it('should serve a index.html file', function (done) {
		var app = server();

		var req = http.request({
			host: 'localhost',
			port: 3000,
			method: 'GET'
		}, function (res) {
			expect(res).to.exist;

			res.setEncoding('utf8');
			var data = '';

			res.on('data', function (chunk) {
				data+= chunk;
			});

			res.on('end', function () {
				expect(data).to.equal('foo');
				done();
			});
		});

		req.end();
	});
});
