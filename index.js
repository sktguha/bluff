var socket = io();
var suitMap = {};
var cards = [];
function login(){
    var user = prompt('enter userName');
    setCookie('user', user);
    $('#user').val('username is '+user+'. click to change');
}
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
    cardsToAdd = JSON.parse(cardsToAdd);
    cards.concat(cardsToAdd);
    updateCards(cards);
}
function updateCards(cards){
    var myCards = document.getElementById('cards');
    var ci = {};
    cards.sort();
    cards.forEach(function(card){
        ci[card] = ci[card] || 0;
        ci[card] ++;
    });
    updateCardDom(ci,myCards);
}
//updateCards([1,2,3,3,3,4,3,2,7]);
function updateCardDom(cards, myCards){
    for(var i in cards){
        var td = document.createElement("td");
        $(td).css('text-align', 'center');
        var elem = document.createElement("div");
        elem.innerHTML = "<div class='card'></div>   <div class='cardno'><div></div>";
        var img = getImage(i);
        elem.getElementsByClassName('card')[0].appendChild(img);
        elem.getElementsByClassName('cardno')[0].innerText = cards[i];
        td.appendChild(elem);
        myCards.appendChild(td);
    }
}
function getImage(i){
    //var map = {1:'ace', 11 : 'jack', 12: 'queen', 13:'king'};
    var img = document.createElement("img");
    suitMap[i] = suitMap[i] || Math.floor(Math.random()*4);
    img.src = "images/"+ i + '_of_' + ['hearts','spades', 'clubs', 'diamonds'][suitMap[i]]+".png";
    img.style.width = img.style.height = '100px';
    return img;
}
function getUser(){
    var name =  getCookie('name');
    while(!name){
          name = window.prompt('userName is missing. please enter username to continue');
         setCookie('name', name);
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
function setCookie(cname, cvalue, exdays){
    exdays = exdays || 365;
    var d = new Date();
    d.setTime(d.getTime() + (exdays*24*60*60*1000));
    var expires = "expires="+d.toUTCString();
    document.cookie = cname + "=" + cvalue + "; " + expires;
}