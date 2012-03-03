$(document).ready(function(){
	var socket = io.connect("http://microchat.nodejitsu.com/");
	//var socket = io.connect("http://localhost:3000/");
	var room = window.location.href.split('/');
	if(room[room.length - 1]){
		room = room[room.length - 1];
	}
	else{
		room = room[room.length - 2];
	}
	socket.emit('adduser', room);
	var chatBox = document.getElementById('messagefeed');
	var roster = $("#people");
	//socket.emit("readd");
	
	setTimeout(function(){
		$('#chat_input').focus();
	}, 600);
	$('#chat_form').submit(function(){
		var message = $('#chat_input').val();
		socket.emit('chatmessage', message);
		var message = $('#chat_input').val('');
		return false;
	});

	socket.on('newchat', function(name, message, color){
		$("#messagefeed").append("<p style='color:" + color + ";'>" + name + ": " + message + "</p>");
		chatBox.scrollTop = chatBox.scrollHeight;
	});
	
	//socket.emit('getroom');
	socket.on('sendroom', function(room){
		roster.html('');
		for(var i = 0; i < room.length; i++){
			person = room[i];
			roster.append("<p>" + person + "</p>");
		}
	});
	
	/*
		BUILD IN ROOM CHANGE
		and
		DYNAMIC LOGIN
	*/
	
});