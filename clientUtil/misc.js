function logout(){
    if(!window.confirm('sure you want to log out ?')) return;
    deleteCookie('user');
    window.FB.logout();
    location.reload();
}
function sendChat(ct){
    ct = ct || $('#chat-content').val();
    $.ajax({
         url : '/?type=chat&content='+ct+'&name='+getUser(),
        success :  function(){
            $('#chat-content').val("");
        }
    });
   return false;
}
function getCardImage(i, dim){
    //var map = {1:'ace', 11 : 'jack', 12: 'queen', 13:'king'};
    dim = dim || {};
    var img = document.createElement("img");
    suitMap[i] = suitMap[i] || Math.floor(Math.random()*4);
    img.src = "images/"+ i + '_of_' + ['hearts','spades', 'clubs', 'diamonds'][suitMap[i]]+".png";
    img.style.width = dim.width || '130px';
    img.style.height = dim.height || '130px';
    return img;
}

function updateStatus(msg){
    var list = ["current player", "-"];
    if(msg.text.indexOf(list[0]) === -1 && msg.text.indexOf(list[1]) === -1){
        showUpdate(msg.text);
    }
    if(msg.text.indexOf("-")!== -1){
        var arr = msg.text.split("-");
        var sender = arr[0].trim();
        var message = arr[1].trim();
        $("#chat_div").chatbox("option", "boxManager").addMsg(sender , message);
    }
    var status = $('#events')[0];
    var st = new Date().toString();//new Date(msg.ts).getUTCSeconds() + ":"+new Date(msg.ts).getUTCMinutes() + ":" + new Date(msg.ts).getUTCHours();
    st += "\n" + msg.text;
    status.value = st + '\n' + status.value;
}
function getUser(){
    var name =  getCookie('user');
	
    //TODO : set some count for this
    if(!name){
    checkLoginState();
    throw new Error('name not found');
    }
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
function onError(e){
    showUpdate("lost connection with server","error");
}
onError = _.throttle(onError, 1000);
function setCookie(cname, cvalue){
    var exdays = exdays || 1;
    var d = new Date();
    d.setTime(d.getTime() + (exdays*24*60*60*1000));
    var expires = "expires="+d.toUTCString();
    if(cname === "user"){
        document.cookie = cname + "=" + cvalue; //+ "; "+ expires;
    } else {
        document.cookie = cname + "=" + cvalue;
    }
    }

    function deleteCookie(cname){
        document.cookie = cname+"=; expires=Thu, 01 Jan 1970 00:00:00 UTC";
    }

function polyfills(){
Array.prototype.subArray = function(cards){
    var that = this;
    cards.forEach(function(card){
        var id = that.indexOf(card);
        if(id !== -1){
            that.splice(id, 1);
        }
    });
};
Array.prototype.contains = function(e){
    return this.indexOf(e) !== -1;
}
}
polyfills();

/*Default Options for Messenger UI. See http://github.hubspot.com/messenger/docs/welcome/ for more info*/
Messenger.options = {
    extraClasses: 'messenger-fixed messenger-on-bottom messenger-on-right',
	theme:'future'
}

/*Updates the messenger UI*/
function showUpdate( msg, msg_type){

		if (typeof(msg_type)==='undefined') msg_type = "info"; /*if no message type is passed , default it to info*/

		Messenger().post({
		message:msg,
		type:msg_type,
		 showCloseButton: true
		 });
}

/*Make the Control fixed to the bottom on scroll
var elementPosition = $('#turn-container').offset();

$(window).scroll(function(){
        if($(window).scrollTop() > elementPosition.top){
              $('#turn-container').css('position','fixed').css('bottom','1%');
        } else {
            $('#turn-container').css('position','static');
        }    
});
*/
