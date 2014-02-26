var net = require('net');
var requestHeader = "get ";

var findLatest = function(name) {
  // will query peers for latest version
  return { 'ip': '127.0.0.1', 'port': 12345, 'hash': '.' + name };
}

var getLatest = function(request, res) {
  fileID = findLatest(request);
  conn = net.createConnection({ 'host': fileID.ip, 'port': fileID.port}, function() {
    console.log("creating connection to " + fileID.ip + ":" + fileID.port + " looking for file " + fileID.hash);
    conn.write(requestHeader + fileID.hash);
  });
  data = '';
  // ugh
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