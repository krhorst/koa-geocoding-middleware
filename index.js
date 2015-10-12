'use strict'

var request = require('co-request');

module.exports = function koaGeocodeMiddleware (blacklist) {	
	return function * (next) {
		var ip = this.ip;
		var url = "http://ipinfo.io/" + ip + "/json";	
		var path_blacklist = Array.isArray(blacklist) ? blacklist : []; 

		this.geo = {};
		this.has_geo = false;

		if (path_blacklist.indexOf(this.path) === -1){		
			try {
				var geo_request = yield request(url);
				if (geo_request.statusCode === 200){
					var parsed_data = JSON.parse(geo_request.body);
					this.geo.loc = parsed_data.loc
					this.has_geo = true;
				}
			} catch (e) {
				console.log(e)
			}
		}
	    yield * next;
	 }	
}
