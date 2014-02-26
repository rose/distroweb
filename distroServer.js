var net = require('net');
var fs = require('fs');

var listenPort = 12345;

var inHandler = function(conn) {
  conn.on('end', function() {
    console.log("file downloaded, woohoo!");
  });

  conn.on('data', function(data) {
    // parse the header
    filePath = data.toString().match(/get (.*)/)[1];
    // validation should be here
    fs.readFile(filePath, function(err, content) {
      if (err) {
        console.log('GAAAH!  NO FILE');
        conn.write("404404 not found");
      } else {
        // console.log(content.toString());
        console.log(conn.write("200" + content.toString()));
      };
    });

    console.log(data + "  (from " + conn.remoteAddress + ")");
  });

  //fs.readFile('./' + id.hash, function (err, dataRequested) {
    //return dataR
  //});
}

var startup = function() {
	net.createServer(inHandler).listen(listenPort);
}
exports.startup = startup;

