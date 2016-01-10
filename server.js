var http = require("http");
var Util = require("./res/util");
var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);


var _ = require('underscore');
var getParam = Util.getParam, serveFile = Util.serveFile;
var players = [], currPlayer, prevPlayer, currCard, deck = [], sendInitRequest = true;

io.on('connection', function(socket){
    socket.on('chat message', function(msg){
        io.emit('chat message', msg);
    });
});

 http.createServer(function(req, res) {
    if(req.url.indexOf("?") === -1){
        serveFile(req, res);
    } else {
        var name = getParam('name'); //the players id
        var type = getParam('type');
        if(!name){
            console.log('redirecting to login page as no name param present');
            serveFile({url : 'login.html?fromgame=true'}, res);
            return;
        }
        //types are place , show, save(login info)
        if(type === "place"){
            //place cards on deck
            var cards = getParam('cards'); // an object containing the cards placed by the player
            addToDeck(JSON.parse(cards));
            prevPlayer = currPlayer;
            currPlayer = name;
            startTimeout();
        }
        console.log('got request for ',name, ' for ', count, ' tweets');
        name = name || "twitterapi";
        count = count || 10;
    }
}).listen(process.argv[2] || 8000);

function checkforplayers(){
      if(players.length === 0 ){
          //send init request on next poll
          sendInitRequest = true;
      }
}
function addToDeck(card){
    deck.push(card);
    }
}
