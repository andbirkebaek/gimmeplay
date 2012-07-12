
var url = require('url');

var gimmebar = require('../gimmebar');
var gimme = new gimmebar.Gimme();

getAsset = function(req, res){
	var pathname = url.parse(req.url).pathname.substring(1).split('/');
  	var view = {
		title: 'Player', 
  		username: pathname[0],
  		playerType: pathname[1]
	};
	gimme.setUsername(view.username);

	// Check if it is an asset that the person wants to play
	if (view.playerType == 'a' || view.playerType == '') {
		view.assetID = pathname[2];
		// if there is an ID, then get that asset
		if (view.assetID) {
			getAssetById(view.assetID, function(asset) {
				view.asset = getAssetParams(res, asset);

				// Chooses the right view based on service
				if (view.asset.service == 'youtube') {
					res.render('youtubeplayer', view);
				} else if (view.asset.service == 'vimeo') {
					res.render('vimeoplayer', view);
				} else {
					// Errors out here. TODO: Get a new asset instead.
					view = {title: 'Yikes', error: 'We dont know how to deal with this type of asset.'};
					res.render('error', view);
					getRandomAsset(res, req, view);
				};
			});
		} else {
			// If there's no assetID, get a random one
			getRandomAsset(res, req, view);
		}
	} else if (view.playerType = 'djs') {
		view.collection_slug = pathname[2];
		view.assetID = pathname[3];
		// If there is an assetID, get that asset
		if (view.assetID) {
			getAssetById(view.assetID, function(asset) {
				view.asset = getAssetParams(res, asset);
				if (view.asset.service == 'youtube') {
					res.render('youtubeplayer', view);
				} else if (view.asset.service == 'vimeo') {
					res.render('vimeoplayer', view);
				} else {
					view = {title: 'Yikes', error: 'This is where we choose what to render (getAsset)'};
					res.render('error', view);
				}
			});
		} else {
			// Otherwise, get a random asset from that collection
			getAssetFromCollection(res, req, view);
		}
	} else {
		// If none of the stuff above worked, render the 404 page
		view = {title: '404', error: 'Super fail.' };
		res.render('404', view);
	}
};

function getAssetFromCollection (res, req, view) {
	gimme.getAssetFromCollection(function (err, data) {
		if (!err) {
			if (data.errors && data.errors[0].name === "RESOURCE_NOT_FOUND") {
				res.render('404', view = {title: 'Error', error: 'Ressource not found'});
			} else {
				if (!req.session.username || !req.session.collection_slug) {
					req.session.username = view.username;
					req.session.collection_slug = view.collection_slug;
					req.session.total = data.total_records;
				} else if (req.session.username != view.username || req.session.collection_slug != view.username || req.session.total != data.total_records) {
					req.session.username = view.username;
					req.session.collection_slug = view.collection_slug;
					req.session.total = data.total_records;
				}

				view.asset = getAssetParams(req, data.records[0]);
				if (view.asset.service == 'youtube') {
					res.render('youtubeplayer', view);
					req.session.runs = 0;
				} else if (view.asset.service == 'vimeo') {
					res.render('vimeoplayer', view);
					req.session.runs = 0;
				} else {
					if (req.session.total != 0) {
						// This gives an infinite loop when a collection doesn't have a video
						//getAssetFromCollection(res, req, view);
						if(!req.session.runs) {
							req.session.runs = 0;
						}

						if (req.session.runs < 5) {
							req.session.runs++;
							console.log('were in there now and the count is: ' + req.session.runs); 
							getAssetFromCollection(res, req, view);
						} else {
						view = {title: 'Whoops', error: 'We couldn\'t find any videos in here. Try another collection.'};
						res.render('error', view);
						req.session.runs = 0;
						}
					} else {
						view = {title: 'Huh', error: 'There\' no videos in here it seems.'};
						res.render('error', view);
						req.session.runs = 0;
					}
				}
			}
		}
	}, {
		'limit': 1,
		'skip': req.session.total ? parseInt(Math.random()*req.session.total, 10) : 0,
		'type': 'embed',
		'slug': view.collection_slug
	});
}

function getRandomAsset (res, req, view) {
	gimme.getPublicAssets(function (err, data) {
		if (!err) {			
			if (data.errors && data.errors[0].name === 'RESOURCE_NOT_FOUND') {
				res.render('404', view = {title: 'error', error: 'Ressource not found'});
			} else {
				if (!req.session.username) { // first run
					req.session.username = view.username;
				 	req.session.total = data.total_records;
				} else if (req.session.username != view.username ) { // different user
					req.session.username = view.username;
				 	req.session.total = data.total_records;
				} else if (req.session.total != data.total_records) {
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
					//view = {title: 'Yikes', error: 'Service isnt known. TODO: Get a new asset.'};
					//res.render('error', view);
					if (req.session.total != 0) {console.log('count is: ' + req.session.total);
						getRandomAsset(res, req, view);
					} else {
						view = {title: 'Yikes', error: 'This guy has no collections. (getRandomAsset)'};
						res.render('error', view);
					}
				}
				//Need to set the URL appropriately after rendering the view
				//setPathAndQuery(req, view);
			}
		}
	}, {
		// The first time this is run, skip is set to 0, but after that it's random based on the total_records
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
		//  var src = asset.content.params.src;

		var src = asset.source;

		// This checks what the first part of the links is. It's probably far from robust?
		var firstPartOfURL = src.split("http")[1].substring(0, 3);
		if (firstPartOfURL == '://') {
			var service = src.split("http://")[1].substring(0, 5);
		} else {
			var service = src.split("https://")[1].substring(0, 5);
		}

		// Sets service to the appropriate service
		if (service == 'www.y') {
			service = 'youtube';
		} else if (service == 'vimeo') {
			service = 'vimeo';
		} else {
			service = 'unknown';
		}

		// Finds the ID for youtube and vimeo videos.
		if (service == 'youtube') {
			var video_id = asset.source.split("v=")[1].substring(0, 11); // TODO: It can crash here. What to do?
		} else if (service == 'vimeo')  {
			var video_id = asset.source.split("com/")[1].substring(0, 8);
		}

		return {
			'id': asset.id,
			'source': asset.source,
			'video_id': video_id,
			'title': asset.title,
			'short_url_token': asset.short_url_token,
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