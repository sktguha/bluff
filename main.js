var http = require('http');
// a map of functions to roooms
var roomMap = {};
var rooms = [];
var Room = require("./Room");
var Util = require("./res/Util");
var http = require("http");
var read = Util.read.bind(Util);
var write = Util.write.bind(Util);
var serveFile = Util.serveFile;
var _ = require('underscore');
http.createServer(function(req, res){
	console.log(req.url);
	var type = Util.getParam("type", req);
	var roomname= Util.getParam('checkroom', req);
	if(req.url == "/"){
		Util.serveFileDirect("/main.html", res);
		return;
	}
	if(req.url.indexOf("?") === -1){
		Util.serveFile(req, res);
		return;
	}
	//yay rooms name availalble
	if (roomname){
		if(rooms.indexOf(roomname) === -1){
				addRoom(roomname);
				res.end('available');
			} else {
				res.end('not-available');
			}
		var roomName = Util.getParam('roomName', req);
		if(roomName && roomName !== "undefined"){
			roomMap[roomName](req, res);
		}
		return;
	}
	if(type === 'undefined' || !type){        //if requested from anyone else as fb etc and also no roomname
		Util.serveFile( "/main.html", res);
		return;
	}
}).listen(process.env.PORT || 8000);

function addRoom(roomName){
	rooms.push(roomName);
	var room = new Room();
	var readPartial = _.partial(read, roomName);
	var writePartial = _.partial(write, roomName);
	//the listener function would be the http.createServer thing listener inside the function
	var registerListener = function(listener){
		roomMap[roomName] = listener;
	} ;
	room(registerListener, readPartial, writePartial);
}
