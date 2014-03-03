var net = require('net');
var fs = require('fs');

var listenPort = 12345;


var inHandler = function(conn) {
  conn.on('end', function() {
    console.log("Server:  File served, closing connection");
  });

  conn.on('data', function(data) { // assuming request will be a single chunk
    console.log("Server:  Received " + data + " request from " + conn.remoteAddress); 
    filePath = getPath(data);
    serveFile (filePath, conn);
  });
}

var serveFile = function(path, conn) {
  // todo hardcoded headers make baby jesus cry
  fs.readFile(path, function(err, content) {
    if (err) {
      console.log('Server:  Unable to read ' + filePath);
      conn.write("404404 not found");
    } else {
      conn.write("200" + content.toString());
      console.log("Server:  sent " + content.toString().substr(0,20) + "...");
      conn.end();
    };
  });
}

var getPath = function() {
  // todo header should not be hardcoded.  Use json or assume all requests are get?
  return data.toString().match(/get (.*)/)[1];
  // todo security - ensure that they are only requesting a file we want to serve
}

var startup = function() {
  net.createServer(inHandler).listen(listenPort);
  console.log("Server:  Listening on port " + listenPort);
}

exports.startup = startup;

