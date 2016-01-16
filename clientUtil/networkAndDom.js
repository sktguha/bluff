
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
    var ci = {};
    cards.sort();
    cards.forEach(function(card){
        ci[card] = ci[card] || 0;
        ci[card] ++;
    });
    return ci;
}

function _updateCardDom(carddata, myCards){
    myCards.innerHTML = "";
    for(var i in carddata){
        var td = document.createElement("td");
        td.className = 'card-container';
        $(td).css('text-align', 'center');
        var elem = document.createElement("div");
        elem.innerHTML = "<div class='card'></div><table><tr><td><span class='cardno'></span></td></tr></table></div>";
        var img = getCardImage(i);
        elem.getElementsByClassName('card')[0].appendChild(img);
        elem.getElementsByClassName('cardno')[0].innerText = carddata[i];
        $(elem).data('no',i);
        td.appendChild(elem);
        myCards.appendChild(td);
    }
}

function updatePlayers(pData, curr){
    var template = "<span class='name'></span><span class='noc'></span>";
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
        } else if(name === curr){
            $(pe).addClass('curr-player');
        }
        $('#players').append(pe);
    }
}