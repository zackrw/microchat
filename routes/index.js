
/*
 * GET home page.
 */

var util = require('util');

exports.index = function(req, res){
	console.log(util.inspect(req.headers, 1));
	var value = '';
	if(req.session.recentRoom){
		value = req.session.recentRoom;
	}
		req.session.recentRoom = '';
		console.log("VALUE: " + value);
  	res.render('index', { title: 'Home', value: value })
};

exports.room = function(req, res){
	res.render('room', {title: 'Room', layout:'layout2' });
}

exports.join = function(req, res){
	var name = req.body.name;
	req.session.name = name;
	var room = req.body.room;
	req.session.room = room;
	res.redirect('/rooms/' + room);
}