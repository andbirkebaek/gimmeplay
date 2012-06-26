/*
 * GET player.
 */

var url = require('url');

exports.index = function(req, res){
	var pathname = url.parse(req.url).pathname.substring(1).split('/');
  
  	res.render('player', { 
  		title: 'Player', 
  		videoid: pathname[1] 
  	});
};