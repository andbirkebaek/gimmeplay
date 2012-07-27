
var url = require('url');

var gimmebar = require('../gimmebar');
var gimme = new gimmebar.Gimme();

function getAsset(req, res){
	var pathname = url.parse(req.url).pathname.substring(1).split('/');
  	var view = {
		title: 'Player', 
  		username: pathname[1],
  		playerType: pathname[0]
	};
	gimme.setUsername(view.username);

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
					view = {title: 'Yikes', error: 'We don\t know how to deal with this one. Sorry.'};
					res.render('error', view);
				};
			});
		} else {
			// If there's no assetID, get a random one
			getRandomAsset(res, req, view);
		}
	} else if (view.playerType = 'u') {
		view.collection_slug = pathname[2];
		getAssetFromCollection(res, req, view);
	} else {
		// If none of the stuff above worked, render the 404 page
		view = {title: '404', error: 'Sorry about that, Tim.'};
		res.render('404', view);
	}
};

function getAssetFromCollection (res, req, view) {
	gimme.getAssetFromCollection(function (err, data) {
		if (!err) {
			if (data.errors && data.errors[0].name === "RESOURCE_NOT_FOUND") {
				res.render('404', view = {title: 'Yikes', error: 'We couldn\'t find the ressource. Are you sure this collection exists?'});
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
						if(!req.session.runs) {
							req.session.runs = 0;
						}

						if (req.session.runs < 5) {
							req.session.runs++;
							console.log('were in there now and the count is: ' + req.session.runs); 
							getAssetFromCollection(res, req, view);
						} else {
						view = {title: 'Whoops', error: 'We couldn\'t find any videos in here. Can we ask you to try another collection. Thanks you.'};
						res.render('error', view);
						req.session.runs = 0;
						}
					} else {
						view = {title: 'Hey,', error: 'There\' no videos in here. Try a collection with videos in it, ok?'};
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
				res.render('404', view = {title: 'error', error: 'We couldn\'t find the ressource. Try another one!'});
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
					if (req.session.total != 0) {console.log('count is: ' + req.session.total);
						getRandomAsset(res, req, view);
					} else {
						view = {title: 'Yikes', error: 'There is no gimmies here, sir.'};
						res.render('error', view);
					}
				}
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

		// This checks what the first part of the links is. TODO: Make more robust.
		var firstPartOfURL = src.split("http")[1].substring(0, 3);
		if (firstPartOfURL == '://') {
			var service = src.split("http://")[1].substring(0, 5);
		} else {
			var service = src.split("https://")[1].substring(0, 5);
		}

		// Sets service to the appropriate
		if (service == 'www.y') {
			service = 'youtube';
		} else if (service == 'vimeo') {
			service = 'vimeo';
		} else {
			service = 'unknown';
		}

		// Get the ID
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


exports.getAsset = getAsset;