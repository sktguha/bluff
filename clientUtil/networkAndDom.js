
function sendShowCards(){
    $.ajax({
        url : '/?type=show&name='+getUser(),
        datatype : 'json',
        success : function(data){
            // socket.emit('show cards', data );
            //this will come in response to showCards or a success
            data = JSON.parse(data);
            if(data.status === "youFailed"){
                alert('oops not a bluff');
            } else if(data.status === "error"){
                alert(data.label);
            }else {
                alert('you caught '+data.name+" 's bluff" );
            }
        },
        error : onError
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
    $(myCards).empty();
    carddata.forEach(function(card){
        var num = card.num;
        var td = document.createElement("td");
        td.className = 'card-container';
        $(td).css('text-align', 'center');
        var elem = document.createElement("div");
        elem.innerHTML = "<div class='card'></div><table><tr><td><span class='cardno'></span></td></tr></table></div>";
        var img = getCardImage(num);
        $('.card', elem).append(img);
        $('.cardno', elem).text(card.quantity);
        $(elem).data('no',num);
        td.appendChild(elem);
        myCards.appendChild(td);
    });
}

function updatePlayers(pData, curr, prev){
    var template = "<span class='name'></span><span class='noc'> cards </span><input type='button' class = 'kick' value='kick'/>";
    $('#players').empty();
    for(var name in pData){
        var pe = document.createElement("td");
        pe.className = 'playerContainer';
        $(pe).append(template);
        $('.name', pe).text(name+" ");
        $('.noc', pe).text(pData[name]);
        if(name === getUser()){
            //pe.getElementsByClassName('name')[0].innerText = "you  ";
            $(pe).addClass('own-player');
        } 
        if(name === curr){
            $(pe).addClass('curr-player');
        }
        if(name === prev){
            $(pe).addClass('prev-player');
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