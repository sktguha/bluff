function sendPlaceCards(cards){
    var data = JSON.stringify({
        cards : cards,
        name : getUser()
    });
    socket.emit('place cards', data );
}
function sendShowCards(){
    var data = JSON.stringify({
        name : getUser()
    });
    $.ajax({
        url : '/?type=show&name='+getUser(),
        datatype : 'json',
        success : function(data){
            // socket.emit('show cards', data );
            //this will come in response to showCards or a success
            data = JSON.parse(data);
            if(data.status === "pawned"){
                var cardsToAdd = JSON.parse(data.cardsToAdd);
                cards.concat(cardsToAdd);
                updateCards(cards);
            }
        }
    });
}