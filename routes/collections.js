/*
 * GET home page.
 */

exports.getCollections = function(req, res){
  res.render('collections', { title: 'Collections' });
};