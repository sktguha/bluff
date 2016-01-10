var http = require("http");
var Util = require("./res/util");
var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var read = Util.read;
var write = Util.write;

var _ = require('underscore');
var getParam = Util.getParam, serveFile = Util.serveFile;
var players = [], isConnected, currPlayer, prevPlayer, currCard, table = [],currentTableNumber , sendInitRequest = true, timerLength=30, timer;
//hardcoded for now
players = [1,2,3,4,5,6,7,8];//read('');
io.on('connection', function(socket){
    isConnected = true;
});

function startNewTimer(){
    clearTimeout(timer);
    timer = setTimeout(function(){
        kickPlayer();
    }, timerLength);
}

function getNext(ind){
    //have to update the logic later on if slots are occupied or not
    return ind === players.length-1 ? 0 : ind+1;
}

function kickPlayer(player){
    player = player || currPlayer;
    if(player !== currPlayer) return;
    var ind = players.indexOf(player);
    players.splice(ind, 1);
    if(!checkNoPlayers()){
        ind = getNext(ind);
        setCurrentPlayer(players[ind]);
        startNewTimer();
    }
}

function checkNoPlayers(){
    if(players.length <= 0){
        //broadcast init requests to all the players
        //game over. exit
    }
}

 http.createServer(function(req, res) {
    if(req.url.indexOf("?") === -1){
        serveFile(req, res);
    } else {
        var name = getParam('name'); //the players id
        var type = getParam('type');
        if(!name){
            console.error('redirecting to login page as no name param present');
            serveFile({url : 'login.html?fromgame=true'}, res);
            return;
        }
        if(type === 'init'){
            var cts = read(name);
            if(!cts){
            new Array(10).forEach(function(){
                cts.push(Math.floor(Math.random()*13)+1);
            });
            res.write(JSON.stringify(cardToSend));
            write(name) ;
            }
        }
        //place cards
        else if(type === "place cards"){
            //place cards on table
            var cards = JSON.parse(getParam('cards')); // an object containing the cards placed by the player
            table.push(cards);
            prevPlayer = currPlayer;
            ind = players.indexOf(name);
            setCurrentPlayer(players[ind === players.length?0:ind+1], cards, 'sub');
            startNewTimer();
            res.write('success');
        }  // show button will be disabled by client if not current turn or no cards on the table
        //the current turn will be broadcasted to all clients. the one whose turn is will place the turn . others will turn their indicators active
        else if(type === "show"){
            if(name !== currPlayer){
                res.write('error');
            }
            var allTable = [];
            table.forEach(function(card){
                allTable.concat(card);
            });
            var lastCards = table[table.length-1];
            if(lastCards.every(function(card){  return card === currentTableNumber; })){
               //no bluff
                broadcast('pawned', [allTable, currPlayer]);
                setCurrentPlayer(prevPlayer);
            } else {
                //bluff caught
                broadcast('pawned', [allTable, prevPlayer]);
                setCurrentPlayer('pawned', [allTable, currPlayer]);
            }
            table = [];
            res.write('success');
        } else if(type === "pass"){
            if(name !== currPlayer){
                res.write('error');
            }
            var ind = players.indexOf(name);
            broadcast('current player', [currPlayer]);
        } else if(type === "kick"){
             var kickedPlayer = getParam('kickedPlayer');
            kickPlayer(kickedPlayer);
            broadcast('kick player', [kickPlayer, name]);
        }
    }
}).listen(process.argv[2] || 8000);

function setCurrentPlayer(name, cards, action){
    currPlayer = name;
    //action is add or subtract
    if(action === "add"){
        write(name, (read(name) || []).concat(name));
    } else if (action === "sub"){
        var ccard = read(name) || [];
        ccard.subArray(cards);
        write(name, ccard);
    }
    broadcast('current player', [currPlayer, cards, action]);
}

Array.prototype.subArray = function(cards){
    var that = this;
    cards.forEach(function(card){
        var id = that.indexOf(card);
        if(id !== -1){
            that.splice(id, 1);
        }
    });
};

function broadcast(label, arg){
     io.emit(label, JSON.stringify(arg));
}