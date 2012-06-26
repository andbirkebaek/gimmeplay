
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
	gimme.setUsername(view.username);

	// This should be assetID instead, and if it has one, find it throuhg th API and add metadata to the view.
	if (view.assetID) {
		getAssetById(view.assetID, function(asset) {
			view.asset = getAssetParams(asset);
			res.render('test', view);
			console.log(asset.source);
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
		view.asset = getAssetParams(data.records[0]);
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

function getAssetParams (asset) {
	if (asset) {
		// Gets the ID from the link. This might not be robut.
		var video_id = asset.source.split("v=")[1].substring(0, 11)

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