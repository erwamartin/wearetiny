var countdown = document.getElementsByClassName("countdown")[0];
var days = countdown.getElementsByClassName("days")[0];
var hours = countdown.getElementsByClassName("hours")[0];
var minutes = countdown.getElementsByClassName("minutes")[0];
var secondes = countdown.getElementsByClassName("secondes")[0];

var deadline = new Date(2014, 5, 13, 17, 0, 0, 0);  

setInterval(function(){  
	var now = new Date();
	var diff = deadline.getTime() - now.getTime();

	var s = (diff / 1000) | 0;
	diff -= s * 1000;

	var m = (s / 60) | 0;
	s -= m * 60;

	var h = (m / 60) | 0;
	m -= h * 60;

	var d = (h / 24) | 0;
	h -= d * 24;


	days.innerHTML = (d<10?'0':'')+d;  
	hours.innerHTML = (h<10?'0':'')+h;  
	minutes.innerHTML = (m<10?'0':'')+m;  
	secondes.innerHTML = (s<10?'0':'')+s;  
}, 1000); 