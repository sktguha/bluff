
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

function _sortCards(cards){
    var ci = [];
    cards.forEach(function(card){
        var ind = _.pluck(ci, 'num').indexOf(card);
        if(ind === -1){
            ci.push({
                num : card,
                quantity : 1
            });
        } else {
            ci[ind].quantity ++ ;
        }
    });
    ci.sort(function(c1, c2){
        return c1.quantity > c2.quantity;
    });
    return ci;
}

function _updateCardDom(carddata, myCards){
    myCards.innerHTML = "";
    carddata.forEach(function(card){
        var num = card.num;
        var td = document.createElement("td");
        td.className = 'card-container';
        $(td).css('text-align', 'center');
        var elem = document.createElement("div");
        elem.innerHTML = "<div class='card'></div><table><tr><td><span class='cardno'></span></td></tr></table></div>";
        var img = getCardImage(num);
        elem.getElementsByClassName('card')[0].appendChild(img);
        elem.getElementsByClassName('cardno')[0].innerText = card.quantity;
        $(elem).data('no',num);
        td.appendChild(elem);
        myCards.appendChild(td);
    });
}

function updatePlayers(pData, curr){
    var template = "<span class='name'></span><span class='noc'> cards </span><input type='button' class = 'kick' value='kick'/>";
    document.getElementById('players').innerHTML = "";
    for(var name in pData){
        var pe = document.createElement("td");
        pe.className = 'playerContainer';
        $(pe).append(template);
        pe.getElementsByClassName('name')[0].innerText = name+" ";
        pe.getElementsByClassName('noc')[0].innerText= pData[name];
        if(name === getUser()){
            //pe.getElementsByClassName('name')[0].innerText = "you  ";
            $(pe).addClass('own-player');
        } 
        if(name === curr){
            $(pe).addClass('curr-player');
        }
        $('#players').append(pe);
    }
    $('.kick').on('click', function(e){
        var player = $(e.target).siblings('.name')[0].textContent;
        player = player && player.trim();
        if(!player) return;
        if(!window.confirm('are you sure you want to kick the player ' + player)) return;
        $.ajax({
            url : '/?name='+getUser()+'&type=kick&playerToKick='+player
        });
    });

}