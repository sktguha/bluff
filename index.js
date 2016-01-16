var socket = io();
var suitMap = {};
var cards = [];
//window.error = function (e){
//    alert('some error occured. please report to admin ' + e.toString());
//};

function init(){
    $.ajax({
        url : '/?type=init&name='+getUser(),
        datatype : 'json',
        success : function(data){
            data = JSON.parse(data);
            if(data.status === "welcome"){
                alert('you have logged in as an existing user . if this is not you please login or create new account again with your username');
            } else if(data.status === "new"){
                alert('create new account success');
            }
            updateCards(data.carddata, $('#cards-container')[0]);
           onCommonBroadCastData(data);
            _setupListeners();
        },
        error : onError
    });
}

function onCommonBroadCastData(data){
    updatePlayers(data.playerdata, data.currPlayer);

}

function _setupListeners(){
    $('.card').on('click', function (e) {
        var no = e.target.src.split("/").pop().split("_")[0]*1;
        if($(e.target).parents('#cards-container').length){
            ctab.push(no);
            cards.subArray([no]);
            updateCards(ctab, $('#current-table')[0]);
            updateCards(cards, $('#cards-container')[0]);
        } else if($(e.target).parents('#current-table').length){
            ctab.subArray([no]);
            cards.push(no);
            updateCards(ctab, $('#current-table')[0]);
            updateCards(cards, $('#cards-container')[0]);
        }
    });
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
var ctab = [];
init();
socket.on('kick player', function(msg){

    onCommonBroadCastData(msg[msg.length-1]);
});



socket.on('event', function(msg){
    status.innerText += msg[0]+"\n";
});

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
            elem.innerHTML = "<div class='card'></div><table><tr><td><span class='cardno'></span></td></tr></table></div>";
            var img = getCardImage(i);
            elem.getElementsByClassName('card')[0].appendChild(img);
            elem.getElementsByClassName('cardno')[0].innerText = carddata[i];
            $(elem).data('no',i);
            td.appendChild(elem);
            myCards.appendChild(td);
        }
        /*
        $(document).on('mouseenter', '.card-container', function () {
            $(this).find(":button").show();
            //$(this).find("img").css('height', '130px').css('width', '130px');
        }).on('mouseleave', '.card-container', function () {
                $(this).find(":button").hide();
                //$(this).find("img").css('height', '100px').css('width', '100px');
            }); */
            //_setupListeners();
        //$(this).find("img").css('height', '130px').css('width', '130px');
        _setupListeners();
    }

