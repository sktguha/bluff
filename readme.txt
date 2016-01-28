See it in action https://bluff.herokuapp.com/
To run
npm install
node server
and go to http://localhost:7000 on your browser
chrome is recommended. app does run on mozilla, ie8 and chrome mobile but cannot make any guarantees
WARNING : facebook login won't work on localhost. In that case you need to create a cookie on your browser as user='username_you_desire'
in browser console (press ctrl_shift+j in chrome and ctrl+shift+k in mozilla) enter 
document.cookie = 'user=player1'

for debugging , can use node inspector (need to install the node-inspector npm package, npm install -g node-inspector ), https://github.com/node-inspector/node-inspector
node-debug --save-live-edit server.js

Playlist of the explaination videos here
https://www.youtube.com/watch?v=QUqY4yAiD-A&index=1&list=PLpG-5tAPfrtt9xF36jw54oWDS3MtPTfCr
updated gameplay rules and future plans given below

FUTURE PLANS
1) implement it with websockets 
2) Use token to play . The token are hidden in the internet . you have to find it and use it **
3)play it from mobile
4) expose rest Api to support multiple platform..
5)use Ai (i.e bots) and speech recognition as annyang.js (for ex the player can say 2 more aces ) and the program automatically places the cards that were to be placed
UPDATED Gameplay  : https://raw.githubusercontent.com/sktguha/bluff/master/rules.txt
