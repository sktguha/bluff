var socket = io();
var suitMap = {};
function sendCards(cards){
    var data = JSON.stringify({
        cards : cards,
        name : getCookie('name')
    });
    socket.emit('place cards', data );
}
function showCards(){
    var data = JSON.stringify({
        name : getCookie('name')
    });
    socket.emit('show cards', data );
}
socket.on('get cards', function(cards){
    //got the cards from server
    cards = JSON.parse(cards);
    updateCards(cards);
});
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
updateCards([1,2,3,3,3,4,3,2,7]);
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
function getCookie(name){
    //put logic for name
}
function setCookie(name, value){

}