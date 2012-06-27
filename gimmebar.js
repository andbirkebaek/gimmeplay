var request = require('request');
var qs = require('querystring');

var APIversion = 'v1';
var baseURL = 'https://gimmebar.com/api/' + APIversion;

function Gimme (username) {
	if (username) {
		this.username = username;
	} else {
		this.username = 'bedrich';
	}
}

Gimme.prototype = {
	setUsername: function (username) {
		this.username = username || 'bedrich';
	},
	setMaxRecords: function (total) {
		this.maxRecords = total || 0;
	},
	getPublicAssets: function (callback, opts) {
		var opts = extendObj({
			'limit': 50,
			'skip': parseInt(Math.random()*100, 10), // Instead of using 1000, use the actual number of assets in the persons Library
			'type': 'embed'
		}, opts);
		var url = baseURL + '/public/assets/' + this.username + '?' + qs.stringify(opts);

		request.get({ 'url': url }, function (error, r, body) {
			if (error) {
				callback(error, null);
			} else {
				callback(null, JSON.parse(body));
			}
		});
	},
	getAsset: function (callback, opts) {
		var url = baseURL + '/public/asset/' + opts.id;
		request.get({ 'url': url }, function (error, r, body) {
			if (error) {
				callback(error, null);
			} else {
				callback(null, JSON.parse(body));
			}
		});
	},
	getAssetFromCollection: function(callback, opts) {
		// This takes from the Library, and not the collection for the time being
		var opts = extendObj({
			'limit': 50,
			'skip': parseInt(Math.random()*100, 10), // Instead of using 1000, use the actual number of assets in the persons Library
			'type': 'embed'
		}, opts);
		var url = baseURL + '/public/assets/' + this.username + '?' + qs.stringify(opts)

		request.get({ 'url': url }, function (error, r, body){
			if (error) {
				callback(error, null);
			} else {
				callback(null, JSON.parse(body));
			}

		});
	}
};

function extendObj (org, overwrite) {
	var extended = org;

	if (overwrite) {
		for (var key in org) {
			if (overwrite[key]) {
				extended[key] = overwrite[key];
			}
		}
	}

	return extended;
}

exports.Gimme = Gimme;