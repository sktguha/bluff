$(document).ready(function(){
    $('.ui.modal')
        .modal('setting', 'closable', false)
        .modal('show');

});
function shareURL(site){
    var URL = "";
    switch(site){
        case "facebook":
            URL = "https://www.facebook.com/sharer/sharer.php?s=100&u=https://bluff.herokuapp.com&p[summary]=Play%20bluff%20online!..";
            break;
        case "twitter":
            URL = "http://twitter.com/intent/tweet?text=Play%20bluff%20online!..&url=https://bluff.herokuapp.com/"
    }
    window.open(URL ,"Share", "width=600, height=600");
}
<!-------------------Facebook Plugin-------------->

window.fbAsyncInit = function() {
    FB.init({
        appId      : '997555423639409',
        xfbml      : true,
        version    : 'v2.5'
    });
    FB.getLoginStatus(function(response) {
        statusChangeCallback(response);
    });
};

function statusChangeCallback(response) {
    console.log(response);
    $('#facebook_status_text').text(' ');
    if (response.status === 'connected') {
        testAPI();
    } else if (response.status === 'not_authorized') {

        showUpdate("Please allow access");

    } else {

        showUpdate("Please Login into Facebook!..");
    }
}


function checkLoginState() {
    FB.getLoginStatus(function(response) {
        statusChangeCallback(response);
    });
}

(function(d, s, id) {
    var js, fjs = d.getElementsByTagName(s)[0];
    if (d.getElementById(id)) return;
    js = d.createElement(s); js.id = id;
    js.src = "//connect.facebook.net/en_US/sdk.js";
    fjs.parentNode.insertBefore(js, fjs);
}(document, 'script', 'facebook-jssdk'));

function testAPI() {
    FB.api('/me', function(response) {
        $('.ui.modal').modal('hide');
        $('#user').text(response.name);
        setCookie('user', response.name);
        showUpdate('Logged in as '+response.name+' ','success');
        poll();
    });
}