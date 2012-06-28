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
			'skip': 0,
			'type': 'embed'
		}, opts);

		var url = baseURL + '/public/assets/' + this.username + '?' + qs.stringify(opts);
		console.log(url);
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
		// This gets and asset from the Library, not the collection for the time being
		var collection_slug = opts.slug;
		console.log(collection_slug);
		var opts = extendObj({
			'limit': 50,
			'skip': 0,
			'type': 'embed'
		}, opts);
		

		var url = baseURL + '/public/assets/' + this.username + '/' + collection_slug + '?' + qs.stringify(opts);
		console.log(url);
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

exports.extendObj = extendObj;
exports.Gimme = Gimme;