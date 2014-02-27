var net = require('net');
var router = require('./distroRouter.js');
var requestHeader = "get ";

var findLatest = function(hash) {
  // will query peers for latest version

  latestHash = hash; // latest hash 

  return router.find(latestHash); // list sorted by priority
  
}

var getLatest = function(hash, res) {
  fileID = findLatest(hash)[0];
  conn = net.createConnection({ 'host': fileID.ip, 'port': fileID.port}, function() {
    console.log("creating connection to " + fileID.ip + ":" + fileID.port + " looking for file " + hash);
    conn.write(requestHeader + '.' + hash);
  });

  data = '';

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



exports.getLatest = getLatest;
