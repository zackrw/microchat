
/**
 * Module dependencies.
 */

var express = require('express')
  , routes = require('./routes')
	, io = require('socket.io')
	, MemoryStore = express.session.MemoryStore
	, dirk = require('./helpers/dirk')
	, util = require('util')

var app = module.exports = express.createServer();

var sessionStore = new MemoryStore();

var sio = io.listen(app);

var parseCookie = require('connect').utils.parseCookie;


// Configuration

app.configure(function(){
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express.bodyParser());
  app.use(express.methodOverride());
	app.use(express.cookieParser());
	app.use(express.session({
		store: sessionStore,
		secret: "my secret",
		key: 'express.sid'
		/*
			maybe key should be without quotes
		*/
	}));
  app.use(app.router);
  app.use(express.static(__dirname + '/public'));
});

app.configure('development', function(){
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
 	
});

app.configure('production', function(){
  app.use(express.errorHandler()); 
});


//SIO
sio.set('authorization', function(data, accept){
	if(data.headers.cookie){
		data.cookie = parseCookie(data.headers.cookie);
		data.sessionID = data.cookie['express.sid'];
		data.sessionStore = sessionStore;
		sessionStore.get(data.sessionID, function(err, session){
			if(err || !session){
				accept('Error', false);
			}
			else{
				data.session = session;
				accept(null, true);
			}
		});
	}
	else{
		return accept("No cookie transmitted.", false);
	}
});

var rooms = {};
rooms.dirkland = ["Dirk"];
/*
	ADDING DIRK TO THE MIX
*/
function dirkTalk() {
	var message = dirk.speak();
	sio.sockets.in('dirkland').emit('newchat', "Dirk", message, "#222");
}

var weight = 0;
(function loop() {
    var rand = Math.floor(Math.random() * 50000) + weight;
		weight = rand;
		if(weight % 2 === 0){
			weight = weight/2.5;
		}
    setTimeout(function() {
            dirkTalk();
            loop();  
    }, rand);
})();

sio.sockets.on('connection', function(socket){
	var hs = socket.handshake;
	console.log('A socket with sessionID ' + hs.sessionID 
	        + ' connected!');
	
	socket.on('adduser', function(room){
		console.log("ROOM JOIN!");
		var newRoom = room;
		if(!hs.session.name){
			console.log("LOGIN PROBLEM");
		}
		else{
			hs.session.room = room;
			//if(typeof hs.session.room !== 'undefined'){
				//socket.leave(hs.session.room);
				//hs.session.room = undefined;
			//}
			hs.session.room = newRoom;
			if(typeof rooms[newRoom] === 'undefined'){
				rooms[newRoom] = [];
			}
			rooms[newRoom].push(hs.session.name);
			console.log("User: " + hs.session.name + " is joining room: " + room + "\n");
			socket.broadcast.to(newRoom).emit('newchat', "Notice", hs.session.name + " has just joined the room.", "#222");
			socket.join(hs.session.room);
			sio.sockets.in(hs.session.room).emit('sendroom', rooms[hs.session.room]);
		}
	});
	
	/*socket.on('readd', function(){
		if(typeof rooms[hs.session.room] === 'undefined'){
			rooms[hs.session.room] = [];
		}
		rooms[hs.session.room].push(hs.session.name);
		socket.join(hs.session.room);
	});*/
	
	socket.on('chatmessage', function(message){
		console.log("SESH NAME: " + hs.session.name);
		console.log("\nMessage: " + message);
		console.log("\nroom: " + socket.room);
		message = message.replace(/(<([^>]+)>)/ig,"");
		//console.log("\nSESHMessage: " + hsmessage);
		if(hs.session.name){
			socket.emit('newchat', hs.session.name, message, "#F22")
			socket.broadcast.to(hs.session.room).emit('newchat', hs.session.name, message, "#222");
			if(message.substring(0,4).toLowerCase() === 'dirk' && Math.random() < 0.6 && hs.session.room === 'dirkland'){
				setTimeout(function(){
					dirkTalk();
				}, 300);
			}
		}
		else{
			socket.emit('newchat', "Notice", "You must login from the home page to chat.", "#22F");
		}
	});
	
	socket.on('disconnect', function(){
		if(rooms[hs.session.room]){
			for(var i = 0; i < 	rooms[hs.session.room].length; i++){
				if(rooms[hs.session.room][i] === hs.session.name)
					rooms[hs.session.room].splice(i, 1);
			}
		}
		//sio.sockets.in(hs.session.room).emit('sendroom', rooms[hs.session.room]);
		socket.leave(hs.session.room);
		if(hs.session.name){
			socket.broadcast.to(hs.session.room).emit('newchat', "Notice", hs.session.name + " just peaced out.", "#222");
		}
		socket.broadcast.to(hs.session.room).emit('sendroom', rooms[hs.session.room]);
		hs.session.room = undefined;
	});
	
	//socket.on('getroom', function(){
		//sio.sockets.in(hs.session.room).emit('sendroom', rooms[hs.session.room]);
	//});
});

function checkAuth(req, res, next){
	var value = "";
	if(req.session.name){
		next();
	}
	else{
		console.log("QUERY: " + util.inspect(req.url, 10));
		var query = req.url.split('/');
		console.log("QUERY: " + query.length);
		var value;
		if(query.length === 3){
			value = query[2];
		}
		else if(query.length === 4){
			value = query[3];
		}
		req.session.recentRoom = value;
		res.redirect('/');
	}
} 

// Routes

//GET
app.get('/', routes.index);
app.get('/rooms/:room', checkAuth, routes.room);

//POST
app.post('/join', routes.join);

//404
/*app.get(/\/[^(stylesheets|images|javascripts)]/, function(req, res){
  res.render('404', {title: "Not Found", layout:"layout3"});
});
*/

/*app.get('/:room', function(req, res){
	res.redirect('/rooms/' + req.params.room);
});*/


app.listen(3000);
/*console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);*/
