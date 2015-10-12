'use strict'

var request = require('co-request');

var geo = {	
	
	setDefaultGeo: function(req){
		req.geo = {};
		req.has_geo = false;		
	},

	pathInBlacklist: function(path, blacklist){
		return blacklist.indexOf(path) === -1;
	},
	
	getBlacklistOrDefault: function(blacklist){		 
		return Array.isArray(blacklist) ? blacklist : []; 
	},		
	
	getAPIUrlForIp: function(ip){
		return "http://ipinfo.io/" + ip + "/json";		
	},
	
	setRequestDataIfGeocodeSuccessful: function(req, geo_request){
		var geoData = this.request_successful(geo_request) ? JSON.parse(geo_request.body) : false;					
		if (geoData && geoData.loc) {
			this.setGeoData(req, geoData);
		}
	},

	request_successful: function(response){
		return response.statusCode === 200;
	},
	
	makeGeoRequest: function(geo_request){		
		return this.request_successful(geo_request) ? JSON.parse(geo_request.body) : false;
	},	
	
	setGeoData: function(req, data){
		req.geo = this.transformParsedData(data);
		req.has_geo = true;
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
		geo.setDefaultGeo(this);
		if (geo.pathInBlacklist(this.path, geo.getBlacklistOrDefault(blacklist))){					
			try {
				var url = geo.getAPIUrlForIp(this.ip);
				var geo_request = yield request(url);
				geo.setRequestDataIfGeocodeSuccessful(this, geo_request);
			} catch(e){
				console.log(e);
			}			
		}
	    yield * next;
	 }	
}
