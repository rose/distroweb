var http = require('http');
var fs = require('fs');
//var json = require('json');
var net = require('net');

var browserPort = 1234; // will be 80 someday!
var listenPort = 12345;

var tracker;
var requestHeader = "get ";

// next step: telnet in & request file by name

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

var getRemoteTracker = function() {
  console.log("getRemoteTracker called");
}

var redirectToWeb = function(url, res) {
  res.writeHead(301, { 'Location' : "http:/" + url}); // url already starts with a /, and yes I'm a horrible human being.
  res.end();
}

var findLatest = function(name) {
  // will query peers for latest version
  return { 'ip': '127.0.0.1', 'port': 12345, 'hash': '.' + name };
}

var getLatest = function(fileID, res) {
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

var browserHandler = function (req, res) {
	console.log("Incoming request from " + req.socket.remoteAddress);
  if (req.url.match(/^\/distroweb(\/|$)/)) {
    distroReq = req.url.match(/^\/distroweb(.*)/)[1];
    console.log("DistroWeb request: " + distroReq);
    // TODO security!  check that they are not requesting .. or anything else unsavoury

    fileID = findLatest(distroReq); // idObject { ip:, port:, hash: }
    getLatest(fileID, res);
    console.log("Tracker is: " + tracker.peers[0][1]);
  } else {
    console.log("WWW request: " + req.url);
    redirectToWeb(req.url, res);
	}
};

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
  fs.readFile('./tracker.json', function (err, trackData) {
    if (err) {
      console.log('tracker.json not found!  Crashing now');
      throw err;
    }; 

    tracker = JSON.parse(trackData);

    console.log('tracker read, spinning up http server');
    http.createServer(browserHandler).listen(browserPort);
    net.createServer(inHandler).listen(listenPort);
  });
}

startup();
