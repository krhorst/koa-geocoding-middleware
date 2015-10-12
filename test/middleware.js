var expect    = require("chai").expect;
var geo_middleware = require("../index.js");
var request = require("supertest");
var koa = require("koa");
var nock = require("nock");

var server_with_middleware = function(middleware){
	var app = koa();
	app.proxy = true;  
	return app.use(middleware).use(function * (next){	
			this.body = 'Request Received';
		   	yield * next;
		});
	}

var geocode_api_response = {
	  "ip": "8.8.8.8",
	  "hostname": "google-public-dns-a.google.com",
	  "city": "Mountain View",
	  "region": "California",
	  "country": "US",
	  "loc": "37.3860,-122.0838",
	  "org": "AS15169 Google Inc.",
	  "postal": "94040"
	};
	
describe("middleware", function(){
	
	var api;
	
	beforeEach(function(){
		api = nock("http://ipinfo.io").get("/" + geocode_api_response.ip + '/json').reply(200,geocode_api_response, {'Content-Type': 'application/json'});
	})
			
	it("should allow a request to go through if not on blacklist", function(done){	    
		var server = server_with_middleware(geo_middleware());
		request(server.callback()).get('/').set('X-Forwarded-For', geocode_api_response.ip).expect(200, 'Request Received').end(done);
	})
	
	it("should allow a request to go through if on blacklist", function(done){
		var server = server_with_middleware(geo_middleware(['/']));
		request(server.callback()).get('/').set('X-Forwarded-For', geocode_api_response.ip).expect(200, 'Request Received').end(done);
	});
	
	it("should have called api", function(done){
		var server = server_with_middleware(geo_middleware());
		request(server.callback()).get('/').set('X-Forwarded-For', geocode_api_response.ip).end(function(){
			expect(api.isDone()).to.equal(true);		
			done();
		})
	})
	
	

		
})