
var url = require('url');

var gimmebar = require('../gimmebar');
var gimme = new gimmebar.Gimme();

getAsset = function(req, res){
	console.log('Inside getAsset in plays.js');
	var pathname = url.parse(req.url).pathname.substring(1).split('/');
  	var view = {
		title: 'Player', 
  		username: pathname[0],
  		//assetID: '4fe9c2d129ca15d16f000006' // full page asset
  		//assetID: '4fdb10f6aac422d520000006' // video asset
  		//assetID: '4fe97633aac4220c15000007' // image asset
	};
	console.log('assetId is:' + view.assetID);
	gimme.setUsername(view.username);

	// This should be assetID instead, and if it has one, find it throuhg th API and add metadata to the view.
	if (view.assetID) {
		getAssetById(view.assetID, function(asset) {
			view.asset = getAssetParams(asset);
			res.render('test', view);
			console.log('assetid is known and the source is: ' + asset.source);
		});
	} else {
		getRandomAsset(res, req, view);
	};
};

/*getAsset = function(req, res){
	var pathname = url.parse(req.url).pathname.substring(1).split('/');
  	var view = {
		title: 'Player', 
  		videoid: pathname[1],
  		username: 'andreas',
  		assetID: '4fe9c2d129ca15d16f000006'
	};

	// This should be assetID instead, and if it has one, find it throuhg th API and add metadata to the view.
	if (view.assetID) {
		res.render('player', view);
	} else {
		getRandomAsset(res, req, view);
	};
};*/

getRandomAsset = function(res, req, view) {
	gimme.getPublicAssets(function (err, data) {
		view.asset = getAssetParams(res, data.records[0]);
		console.log('From getRandomAsset, the source is: ' + view.asset.source);
		view.updateLocation = true;
		res.render('test', view);
		//setPathAndQuery(req, view);
	});
};

/*getRandomAsset = function(res, req, view) {
	// Get a random asset through the API here. There is a collection ID in the view.
	var view = {
		title: 'player',
		videoid: '-TTPGAy5H_E'
	}
	// Render the random asset
	res.render('test', view);
	// Update the URL here:
};*/

function getAssetById (asset_id, cb) {
	gimme.getAsset(function (err, asset) {
		if (!err) {
			cb.call(null, asset);
		} else {
			cb.call();
		}
	}, { 'id': asset_id});
}

function getAssetParams (res, asset) {
	if (asset) {
		console.log('before splitting the source: ' + asset.source)

		// This checks what the first part of the links is. It's probably far from robust.
		var firstPartOfURL = asset.source.split("http")[1].substring(0, 3);

		if (firstPartOfURL == '://') {
			var service = asset.source.split("http://")[1].substring(0, 5);
		} else {
			var service = asset.source.split("https://")[1].substring(0, 5);
		}

		// Sets service to the appropriate service
		if (service == 'www.y') {
			service = 'youtube';
		} else if (service == 'vimeo') {
			service = 'vimeo';
		} else {
			service = 'unknown';
		}

		// Finds the ID for youtube and vimeo videos. errors out if it didn't match
		if (service == 'youtube') {
			var video_id = asset.source.split("v=")[1].substring(0, 11);
		} else if (service == 'vimeo')  {
			var video_id = asset.source.split("com/")[1].substring(0, 8);
		} else {
			var view = {
				title: '404',
				error: 'Other source than Youtube and Vimeo. :smithcide:'
			};
			res.render('404', view);
		}

		return {
			'id': asset.id,
			'source': asset.source,
			'video_id': video_id,
			'title': asset.title
		};
	} else {
		return false;
	}
}

/*setPathAndQuery = function(req, view) {
	// Update the URL appropriately.
};*/


exports.getAsset = getAsset;