var express = require('express');
var parser = require('body-parser');
var app = express();
var dict = require('check-word')
wordChecker = dict('en');
let fs = require('fs');


app.use(express.static(__dirname + '/public'));
app.use(parser.urlencoded({extended: true}));
app.use(parser.json());

app.get("/", function(req, res){

	res.sendFile(__dirname + '/index.html');
});

app.get('/checkword/', function(req, res){
	const {key} = req.query;
	console.log(key);
	const exists = wordChecker.check(key);
	res.setHeader('Content-Type', 'application/json');
	res.end(JSON.stringify({result:exists}));
});

app.get('/randword/', function (req, res){
	const words = fs.readFileSync(__dirname+'/en.txt').toString().split("\n");
	const randomWord = words[Math.floor(Math.random()*words.length)];
	res.setHeader('Content-Type','application/json');
	res.end(JSON.stringify({random:randomWord}));
});


app.listen('3000', function() {
	console.log("Listening on port 3000");
})