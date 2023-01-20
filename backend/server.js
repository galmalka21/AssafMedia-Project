var http = require('http')
var fs = require('fs')

function onRequest(request, response){
    response.writeHead(200, {'Content-Type': 'text/html'})
    fs.readFile('../frontend/html/index.html' , null , function(error,data){
        if (error) {
            response.writeHaed(404)
            response.write("File not found!")
        } else {
            response.write(data)
        }
        response.end()
    })
    
    response.end()
}

http.createServer(onRequest).listen(8000)
console.log("running");
