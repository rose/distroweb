var net = require('net');
var tracker = require('./distroTracker');
var requestHeader = "get ";


var getFile = function(peers, res) {
  data = '';

  fileID = peers[0];
  conn = net.createConnection({ 'host': fileID.ip, 'port': fileID.port}, function() {
    console.log("creating connection to " + fileID.ip + ":" + fileID.port + " looking for file " + hash);
    conn.write(requestHeader + '.' + hash);
  });

  conn.on('data', function(chunk) {
    console.log("got response!");
    data = data + chunk.toString();
  });

  conn.on('end', function(){
    code = data.substr(0,3);
    page = data.substr(3);
    res.writeHead(code, {'Content-Type':'text/html'});
    res.write(page);
    res.end();
  });
}

exports.getFile = getFile;
