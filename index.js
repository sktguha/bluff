var socket; // = io();
var suitMap = {};
var cards = [];
//window.error = function (e){
//    alert('some error occured. please report to admin ' + e.toString());
//};
function login(){
    var user = prompt('enter new user name');
    if(!user) return;
    setCookie('user', user);
    $('#user').val('username is '+user+'. click to change');
    init();
}
function onError(){
    alert('request to server failed. checking your internet connection or reload page. if problem persists clear browser cache and try again');
}
function init(){
    $.ajax({
        url : '/?type=init&name='+getUser(),
        datatype : 'json',
        success : function(data){
            data = JSON.parse(data);
            if(data.status === "welcome"){
                alert('you have logged in as an existing user . if this is not you please login again with your username');
            } else if(data.status === "new"){
                alert('create new account success');
            }
            cards = data.carddata;
            updateCards(cards, $('#cards-container')[0]);
            updatePlayers(data.playerdata);
            _setupListeners();
        },
        error : onError
    });
}

function _setupListeners(){
    $('.add').on('click', function (e) {
        var no = e.target.parentElement.parentElement.children[1].innerText*1;
        ctab.push(no);
        cards.subArray([no]);
        updateCards(ctab, $('#current-table')[0]);
        updateCards(cards, $('#cards-container')[0]);
    });
    $('.sub').on('click', function (e) {
        var no = e.target.parentElement.parentElement.children[1].innerText*1;
        cards.push(no);
        ctab.subArray([no]);
        updateCards(ctab, $('#current-table')[0]);
        updateCards(cards, $('#cards-container')[0]);
    });
}

function updatePlayers(pd){
    var template = "<span class='name'></span><span class='noc'></span>";
    document.getElementById('players').innerHTML = "";
    for(var name in pd){
        var pe = document.createElement("td");
        pe.className = 'playerContainer';
        $(pe).append(template);

        pe.getElementsByClassName('name')[0].innerText = name+" ";
        pe.getElementsByClassName('noc')[0].innerText= pd[name];
        $('#players').append(pe);
    }
}
var ctab = [];
init();
function sendPlaceCards(cards){
    var data = JSON.stringify({
        cards : cards,
        name : getUser()
    });
    socket.emit('place cards', data );
}
function showCards(){
    var data = JSON.stringify({
        name : getUser()
    });
    socket.emit('show cards', data );
    //this will come in response to showCards or a success
    var cardsToAdd = JSON.parse(cardsToAdd);
    cards.concat(cardsToAdd);
    updateCards(cards);
}
function updateCards(cards, myCards){
    myCards = myCards || document.getElementById('cards-container');
    var ci = {};
    setCookie('cards', JSON.stringify(cards));
    cards.sort();
    cards.forEach(function(card){
        ci[card] = ci[card] || 0;
        ci[card] ++;
    });
    _updateCardDom(ci,myCards);
}

    function _updateCardDom(carddata, myCards){
        myCards.innerHTML = "";
        for(var i in carddata){
            var td = document.createElement("td");
            td.className = 'card-container';
            $(td).css('text-align', 'center');
            var elem = document.createElement("div");
            elem.innerHTML = "<div class='card'></div><table><tr><td><input type='button' class='add' value='add'/></td><td><span class='cardno'></span></td><td><input type='button' class='sub' value='sub'/></td></tr></table></div>";
            var img = getCardImage(i);
            elem.getElementsByClassName('card')[0].appendChild(img);
            elem.getElementsByClassName('cardno')[0].innerText = carddata[i];
            $(elem).data('no',i);
            td.appendChild(elem);
            myCards.appendChild(td);
        }
        $(document).on('mouseenter', '.card-container', function () {
            $(this).find(":button").show();
            //$(this).find("img").css('height', '130px').css('width', '130px');
        }).on('mouseleave', '.card-container', function () {
                $(this).find(":button").hide();
                //$(this).find("img").css('height', '100px').css('width', '100px');
            });
            _setupListeners();
        //$(this).find("img").css('height', '130px').css('width', '130px');
    }

function getCardImage(i){
    //var map = {1:'ace', 11 : 'jack', 12: 'queen', 13:'king'};
    var img = document.createElement("img");
    suitMap[i] = suitMap[i] || Math.floor(Math.random()*4);
    img.src = "images/"+ i + '_of_' + ['hearts','spades', 'clubs', 'diamonds'][suitMap[i]]+".png";
    img.style.width = img.style.height = '100px';
    return img;
}
function getUser(){
    var name =  getCookie('user');
    while(!name){
          name = window.prompt('userName is missing. please enter username to continue');
         setCookie('user', name);
    };
    return name;
}
function getCookie(cname) {
    var name = cname + "=";
    var ca = document.cookie.split(';');
    for(var i=0; i<ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0)==' ') c = c.substring(1);
        if (c.indexOf(name) == 0) return c.substring(name.length, c.length);
    }
    return "";
}
function setCookie(cname, cvalue){
    if(getCookie(cname)){
        document.cookie = cname  + "=; expires=Thu, 01 Jan 1970 00:00:00 UTC";
    }
    var exdays = exdays || 365;
    var d = new Date();
    d.setTime(d.getTime() + (exdays*24*60*60*1000));
    var expires = "expires="+d.toUTCString();
    document.cookie = cname + "=" + cvalue + "; ";// + expires;
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