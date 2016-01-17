var Util = require("./res/util");
var app = require('express')();
var httpServer = require('http').Server(app);
var io = require('socket.io')(httpServer);
var http = require("http");
var read = Util.read;
var write = Util.write;
var fs = require('fs');
var won;
var _ = require('underscore');
var serveFile = Util.serveFile;
var del = Util.del;
var lock = {};
var players = [],kickList = [], events, isConnected, currPlayer, prevPlayer, currCard, table = [],currTabNo , sendInitRequest = true, timerLength=10 * 1000, timer, defaultCardNo = 10;
io.on('connection', function(socket){
    isConnected = true;
});
function startNewTimer(){
    clearTimeout(timer);
    timer = setTimeout(function(){
        setCurrentPlayer(getNext(currPlayer));
        startNewTimer();
    }, timerLength);
}
startNewTimer();
http.createServer( function(req, res) {
    console.log(req.url);
    if(req.url.indexOf("?") === -1){
        serveFile(req, res);
    } else {
        var name = Util.getParam('name', req); //the players id
        var type = Util.getParam('type', req);
        if(kickList.indexOf(name) !== -1){
            res.end(JSON.stringify('kick'));
            setTimeout(function(){
                kickList.splice(kickList.indexOf(name),1);
            }, 10000);
            return;
        }
        if(!name){
           // console.error('redirecting to login page as no name param present');
            //serveFile({url : 'login.html?fromgame=true'}, res);
            return;
        }
        //can be new or returning user. doesn't matter. get/generate the required cards
        if(type === 'init'){
            var resp = {};
            var ts = Util.getParam('eventts', req) || Date.now();
            if(players.indexOf(name) !== -1){
                resp.status = "welcome";
            } else {
                resp.status = "new";
                addPlayer(name , req.connection.remoteAddress);
            }
            var carddata = read(name);
            if(!carddata ){
            carddata = getCards();
            write(name, carddata);
            }
            resp.carddata = carddata;
            !events && addEvent('initiating game', 0);
            resp.events = events.filter(function(evt){
                return evt.ts >  ts;
            });
            resp.won = won;
            resp.currTabNo = currTabNo;
            var totTable = [];
            table.forEach(function(card){
                totTable = totTable.concat(card);
            });
            resp.allTable = totTable.length;
            getCommonBroadcastData(resp);
            res.end(JSON.stringify(resp));
        }
        //place cards
        else if(type === "place"){
            //place cards on table
            var cards = JSON.parse(Util.getParam('cards', req)); // an object containing the cards placed by the player
            currTabNo = currTabNo || Util.getParam('currTabNo', req);
            table.push(cards);
            prevPlayer = currPlayer;
            setCurrentPlayer(getNext(name));
            updateCards(name, cards, 'sub');
            startNewTimer();
            addEvent(name + ' put '+cards.length+ (cards.length === 1 ? ' card' : ' cards') + '  on table');
            res.end('success');
        }  // show button will be disabled by client if not current turn or no cards on the table
        else if(type === "show"){
            if(name !== currPlayer){
                res.end('error');
            }
            var allTable = [];
            table.forEach(function(card){
                allTable = allTable.concat(card);
            });
            var lastCards = table[table.length-1];
            if(lastCards.every(function(card){  return card === currTabNo; })){
               //no bluff
                addEvent(currPlayer + ' pawned by ' +  prevPlayer);
                setCurrentPlayer(prevPlayer);
                res.end(lastCards);
                currTabNo = 0;
            } else {
                //bluff caught
                addEvent(prevPlayer + ' pawned by ' +  currPlayer);
                //broadcast('pawned', [prevPlayer, currPlayer]);
                setCurrentPlayer(currPlayer);
            }
            table = [];
            res.end('success');
        } else if(type === "pass"){
            if(name !== currPlayer){
                res.end('error');
            }
            addEvent(name + 'passed');
            lock[name] = true;
            setCurrentPlayer(getNext(name));
            startNewTimer();
            res.end('success');
        } else if(type === "kick"){
             var playerToKick = Util.getParam('playerToKick', req);
            kickPlayer(playerToKick);
        } else if(type === "chat"){
            addEvent(name + '-  '+ Util.getParam('content', req));
            res.end("success");
        }
    }
}).listen(process.argv[2] || 7000);

function setCurrentPlayer(name){
    currPlayer = name;
    addEvent('current player set as '+name);
}

function updateCards(name, cards,action){
    if(action === "add"){
        write(name, ( read(name) || [] ).concat(name));
    } else if (action === "sub"){
        var ccard = read(name) || [];
        ccard.subArray(cards);
        if(!ccard.length){
            setWinnerAndRestart(name);
            return;
        }
        write(name, ccard);
    }
}

function setWinnerAndRestart(name){
won = name;
var rmdir = require( 'rmdir' );
var path  = './storage';
rmdir( path , function ( err, dirs, files ){
    console.log( dirs );
    console.log( files );
    console.log( 'all files are removed' );
    players = [];
    table = [];
    won = name;
    currTabNo = "";
    setTimeout(function(){
        won = "";
    }, 4000);
    try{
    fs.mkdirSync('./storage');
    } catch(e){
        console.error(e);
    }
});
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
     arg = _.toArray(arg);
    arg.push(getCommonBroadcastData());
     io.emit(label, JSON.stringify(arg));
}

function getNext(name){
    //here put logic for game win
    var ind = players.indexOf(name);
    if(ind === -1) return;
    return players[ind === players.length-1 ? 0 : ind+1];
}

function kickPlayer(player){
    player = player || currPlayer;
    var ind = players.indexOf(player);
    if(ind === -1) return;
    players.splice(ind, 1);
    if(currPlayer === player){
        startNewTimer();
    }
    addEvent('kick player ' + player);
    kickList.push(player);
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

function addPlayer(name, add){
    currPlayer = currPlayer || name;
    players.push(name);
    addEvent(name + ' joined from '+add);
}

function getCommonBroadcastData(resp){
    resp = resp || {};
    resp.playerdata = getPlayerData();
    resp.currPlayer = currPlayer;
    return resp;
}

function addEvent(e, ts){
    events = read('1452955861853event')  || [] ;
    events.push({
        ts : ts || Date.now(),
        text : e
    });
    console.log(e);
    write('1452955861853event', events);
}
//http.listen(process.argv[2] || 7000);
try{
    fs.mkdirSync('./storage');
} catch(e){
    console.log(e);
}



