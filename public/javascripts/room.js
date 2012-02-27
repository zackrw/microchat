$(document).ready(function(){
	var socket = io.connect("http://localhost:3000/");

	socket.emit("readd");
	
	setTimeout(function(){
		$('#chat_input').focus();
	}, 600);
	$('#chat_form').submit(function(){
		var message = $('#chat_input').val();
		socket.emit('chatmessage', message);
		var message = $('#chat_input').val('');
		return false;
	});
	//var room = window.location.href;

	socket.on('newchat', function(name, message, color){
		$("#messagefeed").append("<p style='color:" + color + ";'>" + name + ": " + message + "</p>");
	});

});