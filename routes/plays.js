
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
	gimme.setUsername(view.username);

	// So if you want to play an asset, there should be an a.
	if (pathname[1] == 'a' || pathname[1] == '') {
		view.assetID = pathname[2];
		if (view.assetID) { // if there is an ID, render the asset.
			getAssetById(view.assetID, function(asset) {
			view.asset = getAssetParams(res, asset);

			// This is done in a couple of places. Maybe make a new method to streamline this.
			// Chooses the right view based on service
			if (view.asset.service == 'youtube') {
				res.render('youtubeplayer', view);
			} else if (view.asset.service == 'vimeo') {
				res.render('vimeoplayer', view);
			} else {
				view = {title: 'Yikes', error: 'We dont know how to deal with this type of asset. (getAsset)'};
				res.render('error', view);
			};

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
			console.log('This is where it dies isnt it?')
			getAssetById(view.assetID, function(asset) {
			view.asset = getAssetParams(res, asset);

			if (view.asset.service == 'youtube') {
				res.render('youtubeplayer', view);
			} else if (view.asset.service == 'vimeo') {
				res.render('vimeoplayer', view);
			} else {
				view = {title: 'Yikes', error: 'This is where we choose what to render (getAsset)'};
				res.render('error', view);
			};
			});
		} else {					// otherwise, get a random asset from that collection
			getAssetFromCollection(res, req, view);
		}
	} else {						// if none of this works, render the 404 page
		view = {title: '404', error: 'Super fail.' };
		res.render('404', view);
	}
};

function getAssetFromCollection (res, req, view) {
	gimme.getAssetFromCollection(function (err, data) {
		view.asset = getAssetParams(res, data.records[0]);

		view.updateLocation = true;
		if (view.asset.service == 'youtube') {
				res.render('youtubeplayer', view);
			} else if (view.asset.service == 'vimeo') {
				res.render('vimeoplayer', view);
			} else {
				view = {title: 'Yikes', error: 'This is where we choose what to render. Sometimes it gets all the way down here when there isnt and asset. (getAssetFromCollection)'};
				res.render('error', view);
		};
	}, { 'slug': view.slug});
}

function getRandomAsset (res, req, view) {
	gimme.getPublicAssets(function (err, data) {
		if (!err) {			
			if (data.errors && data.errors[0].name === 'RESOURCE_NOT_FOUND') {
				res.render('404', view = {title: 'error', error: 'Ressource not found'});
			} else {

				if (!req.session.username) { // first-run
					req.session.username = view.username;
				 	req.session.total = data.total_records;
				} else if (req.session.username != view.username) { // different user
					req.session.username = view.username;
				 	req.session.total = data.total_records;
				}

				view.asset = getAssetParams(res, data.records[0]);
				view.updateLocation = true;
				if (view.asset.service == 'youtube') {
						res.render('youtubeplayer', view);
					} else if (view.asset.service == 'vimeo') {
						res.render('vimeoplayer', view);
					} else {
						view = {title: 'Yikes', error: 'Service isnt known. (getRandomAsset)'};
						res.render('error', view);
					}
				
				//Need to set the URL appropriately after rendering the view
				//setPathAndQuery(req, view);
			}
		}
	}, {
		'limit': 1,
		'skip': req.session.total ? parseInt(Math.random()*req.session.total, 10) : 0,
		'type': 'embed'
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
		console.log('Source: ' + asset.source);

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

		console.log('Type: ' + service);

		// Finds the ID for youtube and vimeo videos. Gived 404 if we don't recognize the service.
		if (service == 'youtube') {
			var video_id = asset.source.split("v=")[1].substring(0, 11);
		} else if (service == 'vimeo')  {
			var video_id = asset.source.split("com/")[1].substring(0, 8);
		} else {
			var view = {
				title: 'Yikes',
				error: 'Other source than Youtube and Vimeo. Probably because there isnt an asset at that number, or that the type is unknown (godgriner.dk). (getAssetParams)'
			};
			res.render('error', view);
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