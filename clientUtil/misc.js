function login(){
    var user = prompt('enter new user name');
    if(!user) return;
    setCookie('user', user);
    $('#user').val('username is '+user+'. click to change');
}

function getCardImage(i){
    //var map = {1:'ace', 11 : 'jack', 12: 'queen', 13:'king'};
    var img = document.createElement("img");
    suitMap[i] = suitMap[i] || Math.floor(Math.random()*4);
    img.src = "images/"+ i + '_of_' + ['hearts','spades', 'clubs', 'diamonds'][suitMap[i]]+".png";
    img.style.width = img.style.height = '130px';
    return img;
}
var status = $('#events')[0];
function updateStatus(msg){
    var st = new Date().toString();//new Date(msg.ts).getUTCSeconds() + ":"+new Date(msg.ts).getUTCMinutes() + ":" + new Date(msg.ts).getUTCHours();
    st += "\n" + msg.text;
    status.value = st + '\n' + status.value;
}
function getUser(){
    var name =  getCookie('user');
    //TODO : set some count for this
    while(!name){
        name = window.prompt('userName is missing. please enter username to continue');
        setCookie('user', name);
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
function onError(){
    alert('request to server failed. checking your internet connection or reload page. if problem persists clear browser cache and try again');
}
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

Array.prototype.subArray = function(cards){
    var that = this;
    cards.forEach(function(card){
        var id = that.indexOf(card);
        if(id !== -1){
            that.splice(id, 1);
        }
    });
};