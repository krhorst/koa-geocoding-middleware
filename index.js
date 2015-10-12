'use strict'

var request = require('co-request');

var geo = {	
	
	initialize: function(req, blacklist){
		this.req = req;
		this.blacklist = this.getBlacklistOrDefault(blacklist);
	},
	
	setDefaultGeo: function(){
		this.req.geo = {};
		this.req.has_geo = false;		
	},

	pathIsInBlacklist: function(){
		return this.blacklist.indexOf(this.req.path) === -1;
	},
	
	getBlacklistOrDefault: function(blacklist){		 
		return Array.isArray(blacklist) ? blacklist : []; 
	},		
	
	getAPIUrl: function(){
		return "http://ipinfo.io/" + this.req.ip + "/json";		
	},
	
	setGeoDataIfGeoRequestSuccessful: function(geo_request){
		var geoData = this.requestSuccessful(geo_request) ? JSON.parse(geo_request.body) : false;					
		if (geoData && geoData.loc) {
			this.setGeoData(geoData);
		}
	},

	requestSuccessful: function(response){
		return response.statusCode === 200;
	},
	
	setGeoData: function(data){
		this.req.geo = this.transformParsedData(data);
		this.req.has_geo = true;
	},
	
	transformParsedData: function(data){
			var position = data.loc.split(",")
			return {
				lat: position[0],
				long: position[1],
				city: data.city,
				region: data.region,
				country: data.country
			};
	}			
	
};


module.exports = function koaGeocodeMiddleware (blacklist) {	
	return function * (next) {
		geo.initialize(this, blacklist);		
		geo.setDefaultGeo();
		if (geo.pathIsInBlacklist()){					
			try {
				var geo_request = yield request(geo.getAPIUrl());
				geo.setGeoDataIfGeoRequestSuccessful(geo_request);
			} catch(e){
				console.log(e);
			}			
		}
	    yield * next;
	 }	
}
