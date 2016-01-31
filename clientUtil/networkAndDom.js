
function sendShowCards(){
    $.ajax({
        url : '/?type=show&name='+getUser(),
        datatype : 'json',
        success : function(data){
            // socket.emit('show cards', data );
            //this will come in response to showCards or a success
            data = JSON.parse(data);
            if(data.status === "youFailed"){
                showUpdate('oops not a bluff');
            } else if(data.status === "error"){
                showUpdate(data.label);
            }else {
                showUpdate('you caught '+data.name+" 's bluff" );
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
        var div = document.createElement("div");
        div.className = 'ui card card-container';
        $(div).css('text-align', 'center');
        var elem = document.createElement("div");
        elem.innerHTML = "<div class='card'></div><span class='cardno'></span></div>";
        var img = getCardImage(num);
		div.style.width=img.style.width;		/*Prevent Overflow of border*/
		div.style.height=img.style.height;		/*Prevent Overflow of border*/
				
        $('.card', elem).append(img);
        $('.cardno', elem).text(card.quantity);
        $(elem).data('no',num);
        div.appendChild(elem);
        myCards.appendChild(div);
    });
}

function updatePlayers(pData, curr, prev){
    var template = "<span class='name'></span>&nbsp;&nbsp;<span class='noc'></span>&nbsp;cards &nbsp;&nbsp;&nbsp;<input type='button' class = 'kick' value='kick'/>";
    $('#players').empty();
    for(var name in pData){
        var pe = document.createElement("td");
        pe.className = 'playerContainer';
        $(pe).append(template);
        $('.name', pe).text(name+" ");
		$(pe).attr('kick',name+" ");
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
        var player = $(e.target.parentElement).attr('kick');
        player = player && player.trim();
        if(!player) return;
        if(!window.confirm('are you sure you want to kick the player ' + player)) return;
        $.ajax({
            url : '/?name='+getUser()+'&type=kick&playerToKick='+player
        });
    });

}