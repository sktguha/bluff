var http = require("http");
var fs = require('fs');
var path = require('path');

module.exports = {
addEvent : function(e, ts){
    events = read('1452955861853event')  || [] ;
    events.push({
        ts : ts || Date.now(),
        text : e
    });
        write('1452955861853event', events);
    },
    getParam : function(name, req){
        try{
        var str = req.url;
        var res;
        str.split("?")[1].split("&").forEach(function(st){
            if(st.split("=")[0] === name){
                res = st.split("=")[1]; 
            }
        });
        return decodeURIComponent(res);
        } catch (e){
            return false;
        }
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
    _storage : {},
    read : function(name){
        return this._storage[name];
        var val;
        try{
           val = fs.readFileSync("storage/"+name+".txt");
            val = JSON.parse(val);
        } catch(e){
            console.log('file '+name+' not found');
        }
        return val;
    },
    write : function(name, value){
        this._storage[name] = value;
        return;
        fs.writeFileSync("storage/"+ name+".txt", JSON.stringify(value));
    },
    del : function(name){
        delete this._storage[name];
        return;
        fs.deleteFileSync("storage/"+ name+".txt");
    }
};
