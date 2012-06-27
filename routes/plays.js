
var url = require('url');

var gimmebar = require('../gimmebar');
var gimme = new gimmebar.Gimme();

getAsset = function(req, res){
	var pathname = url.parse(req.url).pathname.substring(1).split('/');
  	var view = {
		title: 'Player', 
  		username: pathname[0],
  		//assetID: pathname[2]
  		//slug: pathname[3]
  		//assetID: '4fe9c2d129ca15d16f000006' // full page asset
  		//assetID: '4fdb10f6aac422d520000006' // video asset
  		//assetID: '4fe97633aac4220c15000007' // image asset
	};
	console.log('assetId is:' + view.assetID);
	gimme.setUsername(view.username);

	// This should be assetID instead, and if it has one, find it throuhg th API and add metadata to the view.

	// So if you want to play an asset, there should be an a.
	if (pathname[1] == 'a') {
		view.assetID = pathname[2];
		if (view.assetID) { // if there is an ID, render the asset.
			getAssetById(view.assetID, function(asset) {
			view.asset = getAssetParams(res, asset);

			res.render('test', view);
			console.log('assetid is known and the source is: ' + asset.source);
			console.log('asset title is' + asset.title);
			});
		} else { // if there is no id, get a random video:
			getRandomAsset(res, req, view);
		};
	} else if (pathname[1] = 'djs') { // if it says djs
		view.slug = pathname[2];
		view.assetID = pathname[3];
		if (view.assetID) {			// and there is an id, play it
			getAssetById(view.assetID, function(asset) {
			view.asset = getAssetParams(res, asset);

			res.render('test', view);
			});
		} else {					// otherwise, get a random asset from that collection
			getAssetFromCollection(res, req, view);
		}
	} else {						// if none of this works, render the 404 page
		view = {title: '404' };
		res.render('404', view);
	}
};

function getAssetFromCollection (res, req, view) {
	gimme.getAssetFromCollection(function (err, data) {
		view.asset = getAssetParams(res, data.records[0]);

		view.updateLocation = true;
		res.render('test', view)
	});
}

function getRandomAsset (res, req, view) {
	gimme.getPublicAssets(function (err, data) {
		view.asset = getAssetParams(res, data.records[0]);
		//console.log('From getRandomAsset, the source is: ' + view.asset.source);
		view.updateLocation = true;
		res.render('test', view);
		//setPathAndQuery(req, view);
	});
};

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

		// Finds the ID for youtube and vimeo videos. Gived 404 if we don't recognize the service.
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
			'title': asset.title,
			'service': service
		};
	} else {
		return false;
	}
}

/*setPathAndQuery = function(req, view) {
	// Update the URL appropriately.
};*/


exports.getAsset = getAsset;