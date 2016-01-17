var Util = require("./res/util");
var app = require('express')();
var httpServer = require('http').Server(app);
var io = require('socket.io')(httpServer);
var http = require("http");
var read = Util.read.bind(Util);
var write = Util.write.bind(Util);
var fs = require('fs');
var won;
var _ = require('underscore');
var serveFile = Util.serveFile;
var del = Util.del;
var lock = [];
var players = [], kickList = [], events, isConnected, currPlayer, prevPlayer, currCard, table = [],currTabNo , sendInitRequest = true, TIMERLENGTH=90 * 1000, timer, defaultCardNo = 10;
io.on('connection', function(socket){
    isConnected = true;
});
function startNewTimer(){
    clearTimeout(timer);
    timer = setTimeout(function(){
        lock.push(currPlayer);
        addEvent(currPlayer + ' timed out. assumed as passed his turn');
        console.log(currPlayer + ' timed out. assumed as passed his turn');
        setCurrentPlayer(getNext(currPlayer));
        startNewTimer();
    }, TIMERLENGTH);
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
            !events.length && addEvent('initiating game', 0);
            resp.events = events.filter(function(evt){
                return evt.ts >  ts;
            });
            if(won){
                resp.won = won;
            }
            resp.prevPlayer = prevPlayer;
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
            var cards = JSON.parse(Util.getParam('cards', req));
            currTabNo = currTabNo || Util.getParam('currTabNo', req);
            console.log('currTabNo is '+currTabNo);
            table.push(cards);
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
            //here currPlayer tries a check on previous player
            var allTable = [];
            table.forEach(function(card){
                allTable = allTable.concat(card);
            });
            var lastCards = table[table.length-1];
            if(!lastCards){
                res.end(JSON.stringify({
                   status : 'error',
                   label :   ' no cards on table. need to place some cards'
                }));
                return;
            }
            if(lastCards.every(function(card){  
                return card == currTabNo; 
            })){
               //no bluff
                addEvent(currPlayer + ' pawned by ' +  prevPlayer);
                res.end(JSON.stringify({
                    status : 'youFailed',
                    name : currPlayer
                }));
                updateCards(currPlayer, allTable, 'add');
                startNewRound(prevPlayer);
            } else {
                //bluff caught
                addEvent(prevPlayer + ' pawned by ' +  currPlayer);
                //broadcast('pawned', [prevPlayer, currPlayer]);
                updateCards(prevPlayer, allTable, 'add');
                res.end(JSON.stringify({
                    name : prevPlayer
                }));
                startNewRound(currPlayer);
            }
            table = [];
            res.end('success');
        } else if(type === "pass"){
            if(name !== currPlayer){
                res.end('error');
            }
            addEvent(name + ' passed');
            lock.push(name);
            setCurrentPlayer(getNext(name, true));
            startNewTimer();
            res.end('success');
        } else if(type === "kick"){
             var playerToKick = Util.getParam('playerToKick', req);
            kickPlayer(playerToKick, name);
        } else if(type === "chat"){
            addEvent(name + '-  '+ decodeURIComponent(Util.getParam('content', req)));
            console.log(name + '-  '+ decodeURIComponent(Util.getParam('content', req)));
            res.end("success");
        }
    }
}).listen(process.argv[2] || 7000);

function setCurrentPlayer(name){
    if(!name) return;
    currPlayer = name;
    console.log('current player set as '+name);
}

function updateCards(name, cards,action){
    if(action === "add"){
        write(name, ( read(name) || [] ).concat(cards));
    } else if (action === "sub"){
        var ccard = read(name) || [];
        ccard.subArray(cards);
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
    Util._storage = {};
    addEvent(name + " has won the game");
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

function getNext(name, dontSetPrev){
    //here put logic for game win
    if(players.length === 1){
        prevPlayer = currPlayer;
        return players[0];
    }
    var ct = players.indexOf(name);
    var ind = ct;
    if(ind === -1) {
        startNewRound(players[0]);
        return;
    }
    //find  check for case of only one player left active. then activate him, as all others have passed then
    var diff = _.difference(players, lock);
    if(diff.length === 1){
        startNewRound(diff[0], true);
        return;
    }
    //check if everyone has passed before current player
    if(diff.length === 0){
        startNewRound(name, true);
        return;
    }
    ct = ct === players.length-1 ? 0 :ct+1;
    while(lock.indexOf(players[ct])!== -1){
        ct = ct === players.length-1 ? 0 :ct+1;
    }
    if(!dontSetPrev) {
        prevPlayer = currPlayer;
    }
    if(read(players[ct]) && !read(players[ct]).length){
        setWinnerAndRestart(players[ct]);
    }
    return players[ct];
}

function startNewRound(name, leaveTable, noWinCheck){
    if(read(name) && !read(name).length && !noWinCheck){
        setWinnerAndRestart(name);
    }
    addEvent('new round starting from '+name+' table '+(leaveTable?'same':'cleared'));
    prevPlayer = null;
    currPlayer = name;
    currTabNo = null;
    lock = [];
    if(!leaveTable) table = [];
    startNewTimer();
}

function kickPlayer(player, byName){
    player = player || currPlayer;
    var ind = players.indexOf(player);
    if(ind === -1) return;
    players.splice(ind, 1);
    startNewRound(players[0], false, true);
    addEvent(player + ' was kicked by ' + byName);
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









