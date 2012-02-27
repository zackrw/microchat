
/**
 * Module dependencies.
 */

var express = require('express')
  , routes = require('./routes')
	, io = require('socket.io')
	, MemoryStore = express.session.MemoryStore;

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

sio.sockets.on('connection', function(socket){
	var hs = socket.handshake;
	console.log('A socket with sessionID ' + hs.sessionID 
	        + ' connected!');
	socket.on('adduser', function(name, room){
		console.log("ROOM JOIN!");
		var newRoom = room;
		socket.name = name;
		hs.session.name = name;
		hs.session.room = room;
		if(typeof socket.room !== 'undefined'){
			socket.leave(socket.room);
			socket.room = undefined;
		}
		socket.room = newRoom;
		if(typeof rooms[newRoom] === 'undefined'){
			rooms[newRoom] = [];
			rooms[newRoom].push(socket.nickname);
		}
		console.log("User: " + name + " is joining room: " + room + "\n");
		socket.join(hs.session.room);
			socket.broadcast.to(hs.session.room).emit('newchat', "Notice", name + " has just joined the room", "#222");
	});
	
	socket.on('readd', function(){
		socket.join(hs.session.room);
	});
	
	socket.on('chatmessage', function(message){
		console.log("NAME: " + socket.name);
		console.log("SESH NAME: " + hs.session.name);
		console.log("\nMessage: " + message);
		console.log("\nroom: " + socket.room);
		//console.log("\nSESHMessage: " + hsmessage);
		socket.emit('newchat', hs.session.name, message, "#F22")
		socket.broadcast.to(hs.session.room).emit('newchat', hs.session.name, message, "#222");
	});
	
	socket.on('disconnect', function(){
		hs.session.room = undefined;
		socket.leave(socket.room);
		socket.room = undefined;
		socket.name = undefined;
	});
	
	
	
});


// Routes

//GET
app.get('/', routes.index);
app.get('/:room', routes.room);

//POST
app.post('/join', routes.join);

app.listen(3000);
console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);
