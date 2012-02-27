$(document).ready(function(){
	var socket = io.connect("http://localhost:3000/");
	$('#signin_form').submit(function(){
		var name = $('#name').val();
		var room = $('#room').val();
		socket.emit('adduser', name, room);
		return true;
	});
	
});