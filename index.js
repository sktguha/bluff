var socket = {on:$.noop};//io();
var suitMap = {};
var cards = [], ctab = [];
//window.error = function (e){
//    alert('some error occured. please report to admin ' + e.toString());
//};
var shown = false, timeout = 500, currTabNo,lastTs = 0;

function sendPass(){
    if(ctab.length){
        if(!window.confirm('you have cards placed for sending. sure you want to pass ? ')){
            return;
        }
    }
    $.ajax({
        url : '/?name='+getUser()+'&type=pass',
        success : function(resp){
            resp = JSON.parse(resp);
            if(resp.status === 'error')
                showUpdate(resp.label);
        }
    })
}

function sendPlaceCards(cards){
    cards = cards || ctab;
    if(!cards.length){
        showUpdate('please place some cards on the table else press pass if you want to pass');
        $('.card').children('img').twinkle();
        setTimeout(function(){
            $('#current-table').twinkle();
        }, 1000);
        return;
    }
    var tempCurrTabNo = $('#currTabNo')[0].value;

    if(!currTabNo && (!Number(tempCurrTabNo) || tempCurrTabNo > 13 || tempCurrTabNo < 1)){
         showUpdate("put number in the input box you want to place cards as (1,11,12,13 for A,J,Q,K respectively)");
         tempCurrTabNo = $('#currTabNo')[0].value;
         $('#currTabNo').twinkle();
        return;
    }
    $.ajax({
        url : '/?type=place&cards='+JSON.stringify(cards)+'&currTabNo='+tempCurrTabNo+'&name='+getUser(),
        success : function(e){
            e = JSON.parse(e);
            if(e.status === "error") {
                showUpdate(e.label);
            }
            //set cards on the table to zero
            ctab = [];
            updateCards();
        },
        error : onError
    });
}
poll();
function poll(){
    $.ajax({
        url : '/?type=init&name='+getUser()+'&eventts='+lastTs,
        datatype : 'json',
        success : function(data){
            data = JSON.parse(data);
            if(data.status === "welcome" && !shown){
                //showUpdate('you have logged in as an existing user . if this is not you please login or create new account again with your username');
                shown = true;
            } else if(data.status === "new" && !shown){
                //showUpdate('Account Created Successfully',"success");
                shown = true;
            }
            onPollResponse(data);
            setTimeout(poll, timeout);
        },
        error : onError
    });
}

function onPollResponse(data){
    if(data === "kick"){
        showUpdate('oops it seems you have been kicked from server. please ok to close. please wait atleast 10 sec to join again',"error");
        location.href = '/kicked.html';
    }
    if(data.won){
        showUpdate(data.won + ' has won. press ok to reload page',"success");
        location.reload();
    }
    updatePlayers(data.playerdata, data.currPlayer, data.prevPlayer);
    //if(getUser() === data.currPlayer){
     //   $('#turn-container :input').prop('disabled', false);
   // } else {
   //     $('#turn-container :input').prop('disabled', true);
  //  }
    if(_.difference(data.carddata, cards.concat(ctab)).length){
        /*if(cards.concat(ctab).length && cards.concat(ctab).length < data.carddata.length ){
            //alert('oops your bluff has been caught');
        }   */
        ctab = [];
        cards = data.carddata;
        updateCards();
    }
   if(data.currTabNo && data.currTabNo !== currTabNo){
       $('#currTabNoImg').empty();
       $('#currTabNoImg').append('current claimed table number');
        $('#currTabNoImg').append(getCardImage(data.currTabNo, { width:'100px' , height: '100px'} ) );
    }  else if(!data.currTabNo){
       $('#currTabNoImg').text(data.currPlayer === getUser() ? 'You are starting this round'  : 'No cards placed in this round yet');
    }
    currTabNo = data.currTabNo;
    if(!currTabNo && $('#currTabNo')[0].disabled){
        $('#currTabNo')[0].value = "";
    }
    $('#numOfCards').text(data.allTable || 0);
    data.events && data.events.forEach(function(e){
        updateStatus(e);
        if(e.ts > lastTs){
            lastTs = e.ts;
        }
    });
}

function _setupListeners(){
    $('.card').on('click', function (e) {
        var no = e.target.src.split("/").pop().split("_")[0]*1;
        if($(e.target).parents('#cards-container').length){
            ctab.push(no);
            cards.subArray([no]);
            updateCards();
        } else if($(e.target).parents('#current-table').length){
            ctab.subArray([no]);
            cards.push(no);
            updateCards();
        }
    });
}

function updateCards(cardsInHand, cardsOnTable){
    cardsInHand = cardsInHand || cards;
    cardsOnTable = cardsOnTable || ctab;
    _updateCardDom(_sortCards(cardsInHand),  $('#cards-container')[0]);
   // setCookie('cards', JSON.stringify(cardsInHand));
    _updateCardDom(_sortCards(cardsOnTable),  $('#current-table')[0]);
    _setupListeners();
}
updateCards = _.throttle(updateCards, 500);
/*
 var ctab = [];
 socket.on('kick player', function(msg){

 onCommonBroadCastData(msg[msg.length-1]);
 });



 socket.on('event', function(msg){
 status.innerText += msg[0]+"\n";
 });

 $(document).on('mouseenter', '.card-container', function () {
 $(this).find(":button").show();
 //$(this).find("img").css('height', '130px').css('width', '130px');
 }).on('mouseleave', '.card-container', function () {
 $(this).find(":button").hide();
 //$(this).find("img").css('height', '100px').css('width', '100px');
 }); */
