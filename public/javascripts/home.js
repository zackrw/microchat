$(document).ready(function(){
	var socket = io.connect("http://microchat.jit.su/");
	setTimeout(function(){
		$('#name').focus();
	}, 700);
	
});