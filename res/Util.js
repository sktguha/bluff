var http = require("http");
var fs = require('fs');
var path = require('path');

module.exports = {
    getParam : function(name, req){
        var str = req.url;
        var res;
        str.split("?")[1].split("&").forEach(function(st){
            if(st.split("=")[0] === name){
                res = st.split("=")[1]; 
            }
        });
        return res;
    },
    serveFile: function (request,response){
    var filePath = '.' + request.url;
    if (filePath == './')
        filePath = './index.html';

    var extname = path.extname(filePath);
    var contentType = 'text/html';
    switch (extname) {
        case '.js':
            contentType = 'text/javascript';
            break;
        case '.css':
            contentType = 'text/css';
            break;
        case '.json':
            contentType = 'application/json';
            break;
        case '.png':
            contentType = 'image/png';
            break;
        case '.jpg':
            contentType = 'image/jpg';
            break;
        case '.wav':
            contentType = 'audio/wav';
            break;
    }

    fs.readFile(filePath, function(error, content) {
        if (error) {
            if(error.code == 'ENOENT'){
                fs.readFile('./404.html', function(error, content) {
                    response.writeHead(200, { 'Content-Type': contentType });
                    response.end(content, 'utf-8');
                });
            }
            else {
                response.writeHead(500);
                response.end('Sorry, check with the site admin for error: '+error.code+' ..\n');
                response.end();
            }
        }
        else {
            console.log('served ',filePath);
            response.writeHead(200, { 'Content-Type': contentType });
            response.end(content, 'utf-8');
        }
    });

},
    read : function(name){
       var val;
        try{
           val = fs.readFileSync("storage/"+name+".txt");
        } catch(e){
            console.log('file '+name+' not found');
        }
        if(val){
            return JSON.parse(val);
        } else {
            return false;
        }
    },
    write : function(name, value){
        fs.writeFileSync("storage/"+ name+".txt", JSON.stringify(value));
    }
};
