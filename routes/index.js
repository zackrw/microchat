
/*
 * GET home page.
 */

exports.index = function(req, res){
  res.render('index', { title: 'Home' })
};

exports.room = function(req, res){
	res.render('room', {title: 'Room', layout:'layout2' });
}

exports.join = function(req, res){

	var name = req.body.name;
	req.session.name = name;
	var room = req.body.room;
	req.session.room = room;
	res.redirect('/' + room);
}