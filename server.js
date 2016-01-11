var http = require("http");
var Util = require("./res/util");
var app = require('express')();
var httpserver = require('http').Server(app);
var io = require('socket.io')(httpserver);
var read = Util.read;
var write = Util.write;

var _ = require('underscore');
var serveFile = Util.serveFile;
var players = [], isConnected, currPlayer, prevPlayer, currCard, table = [],currentTableNumber , sendInitRequest = true, timerLength=30, timer, defaultCardNo = 10;
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
    //here put logic for game win
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
    broadcast('kick player', [player]);
}

function getPlayerData(){
    var dat = {};
    players.forEach(function(p){
        dat[p] = read(p).length;
    });
    return dat;
}

function getCards(no){
    no = no || defaultCardNo;
    var cts = [];
    for(var i=0;i<no;i++){
      cts.push(Math.floor(Math.random()*13)+1);
    }
    return cts;
}

function addPlayer(name){
    currPlayer = currPlayer || name;
    players.push(name);
}

 http.createServer(function(req, res) {
    if(req.url.indexOf("?") === -1){
        serveFile(req, res);
    } else {
        var name = Util.getParam('name', req); //the players id
        var type = Util.getParam('type', req);
        if(!name){
            console.error('redirecting to login page as no name param present');
            serveFile({url : 'login.html?fromgame=true'}, res);
            return;
        }
        //can be new or returning user. doesn't matter. get/generate the required cards
        if(type === 'init'){
            var resp = {};
            if(players.indexOf(name) !== -1){
                resp.status = "welcome";
            } else {
                resp.status = "new";
                addPlayer(name);
            }
            var carddata = read(name);
            if(!carddata ){
            carddata = getCards();
            write(name, carddata);
            }
            resp.carddata = carddata;
            resp.playerdata = getPlayerData();
            resp.current = currPlayer;
            res.end(JSON.stringify(resp));
            broadcast('event', [name + 'logged in from '+ req.connection.remoteAddress]);
        }
        //place cards
        else if(type === "place cards"){
            //place cards on table
            var cards = JSON.parse(Util.getParam('cards'), req); // an object containing the cards placed by the player
            table.push(cards);
            prevPlayer = currPlayer;
            ind = players.indexOf(name);
            setCurrentPlayer(players[ind === players.length?0:ind+1]);
            updateCards(name, cards, 'sub');
            startNewTimer();
            res.end('success');
        }  // show button will be disabled by client if not current turn or no cards on the table
        //the current turn will be broadcasted to all clients. the one whose turn is will place the turn . others will turn their indicators active
        else if(type === "show"){
            if(name !== currPlayer){
                res.end('error');
            }
            var allTable = [];
            table.forEach(function(card){
                allTable.concat(card);
            });
            var lastCards = table[table.length-1];
            //on all pawned events client should request for new carddata from server
            if(lastCards.every(function(card){  return card === currentTableNumber; })){
               //no bluff
                broadcast('pawned', [currPlayer, prevPlayer]);
                setCurrentPlayer(prevPlayer);
            } else {
                //bluff caught
                broadcast('pawned', [prevPlayer, currPlayer]);
                setCurrentPlayer(prevPlayer);
            }
            table = [];
            res.end('success');
        } else if(type === "pass"){
            if(name !== currPlayer){
                res.end('error');
            }
            var ind = players.indexOf(name);
        } else if(type === "kick"){
             var kickedPlayer = Util.getParam('kickedPlayer', req);
            kickPlayer(kickedPlayer);
        } else if(type === "carddata"){
            res.end(getPlayerData());
        }
    }
}).listen(7000); //process.argv[2] || 8000

function setCurrentPlayer(name){
    currPlayer = name;
    //action is add or subtract
    broadcast('current player', [currPlayer]);
}

function updateCards(name, cards,action){
    if(action === "add"){
        write(name, ( read(name) || [] ).concat(name));
    } else if (action === "sub"){
        var ccard = read(name) || [];
        ccard.subArray(cards);
        write(name, ccard);
    }
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


