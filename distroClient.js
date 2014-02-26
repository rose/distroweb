var net = require('net');

var findLatest = function(name) {
  // will query peers for latest version
  return { 'ip': '10.0.3.125', 'port': 12345, 'hash': '.' + name };
}

var getLatest = function(request, res) {
  fileID = findLatest(request);
  conn = net.createConnection({ 'host': fileID.ip, 'port': fileID.port}, function() {
    console.log("creating connection to " + fileID.ip + ":" + fileID.port + " looking for file " + fileID.hash);
    conn.write(requestHeader + fileID.hash);
  });

  // ugh
  conn.on('data', function(data) {
    console.log("got response!");
    distroHandler(data)(res);
  });
}

var distroHandler = function (response) {
  // console.log("entering distroHandler");
  //split = response.toString().match(/(.{3})(.*)/);
  //code = split[1];
  //page = split[2];
  str = response.toString();
  code = str.substr(0,3);
  page = str.substr(3);

  return function (res) {
    // console.log("entering callback");
     res.writeHead(code, {'Content-Type':'text/plain'});
    //console.log(page);
    while (!res.write(page));
    res.end();
  };
}


exports.getLatest = getLatest;