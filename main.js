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
	var checkRoomName= Util.getParam('checkroom', req);
	if(req.url == "/"){
		Util.serveFileDirect("/clientMain.html", res);
		return;
	}
	if(req.url.indexOf("?") === -1){
		Util.serveFile(req, res);
		return;
	}
	if (checkRoomName && checkRoomName !== 'undefined'){
		//yay rooms name availalble
		if(rooms.indexOf(checkRoomName) === -1){
				addRoom(checkRoomName);
				res.end('available');
			} else {
				res.end('not-available');
			}
		return;
	}
	var roomdata = Util.getParam('roomdata', req);
	if(roomdata && roomdata !== "undefined"){
		res.end(JSON.stringify(rooms));
		return;
	}
	var roomName = Util.getParam('room', req);
	// main routing logic done
	if(roomName && roomName !== "undefined"){
		if(roomMap[roomName]){
			roomMap[roomName](req, res);
		}  else {
			//return an error
			res.writeHead(404);
			res.end('room not found');
		}
	}
	if(type === 'undefined' || !type){        //if requested from anyone else as fb etc and also no roomname
		Util.serveFile( "/clientMain.html", res);
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
	};
	room(registerListener, readPartial, writePartial);
}

