var statements = [
	function(){return "Hai guys!";},
	function(){return "How are you guys liking the class today?";},
	function(){return "Alexander Du? Is Alexander Du here today?";},
	function(){return "The temperature in Germany is " + Math.floor(20 * Math.random() - 20) + " degrees centigrade.";},
	function(){return "I like chocolate!";},
	function(){return "Aha! Another concept misunderstood by Feldman.";},
	function(){return "We are looking for about sixteen from you guys.";},
	function(){return "I think what is pareto optimal is that we all contribute in lecture.";},
	function(){return "Sometimes the women's clothing fits better than the men's.";},
	function(){return "Has anyone any idea what I am saying?";},
	function(){return "Triple H or the Undertaker? Hehehe I love wrestling.";}
	/*
		function(){return ""},
		function(){return ""},
		function(){return ""},
		function(){return ""},
		function(){return ""},
		function(){return ""},
		function(){return ""},
		function(){return ""},
	*/
	
	
	
];





module.exports.speak = function(){
	var num = statements.length;
	var choice = Math.floor(num * Math.random());
	return statements[choice]();
};