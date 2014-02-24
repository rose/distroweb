var http = require('http');
var fs = require('fs');
//var json = require('json');
var net = require('net');

var tracker;

var distroHandler = function (path) {
  // console.log("entering distroHandler");
  if (path.match(/^\//)) {
  	path = path.substr(1)
  }
  return function (res) {
    // console.log("entering callback");
    res.writeHead(418, {'Content-Type':'text/html'});
    res.end("hello " + path);
  };
}


var getRemoteTracker = function() {
  console.log("getRemoteTracker called");
}

var redirectToWeb = function(url, res) {
  res.writeHead(301, { 'Location' : "http:/" + url}); // url already starts with a /, and yes I'm a horrible human being.
  res.end();
}

var handler = function (req, res) {
	console.log("Incoming request from " + req.socket.remoteAddress);
  if (req.url.match(/^\/distroweb(\/|$)/)) {
    distroReq = req.url.match(/^\/distroweb(.*)/)[1];
    console.log("DistroWeb request: " + distroReq);
    console.log("Tracker is: " + tracker.peers[0][1]);
    distroHandler(distroReq)(res);
  } else {
    console.log("WWW request: " + req.url);
    redirectToWeb(req.url, res);
	}
};

var startup = function() {
  fs.readFile('./tracker.json', function (err, trackData) {
    if (err) {
      console.log('tracker.json not found!  Crashing now');
      throw err;
    }; 

    tracker = JSON.parse(trackData);
    http.createServer(handler).listen(1234);
  });
}

startup();
//http.createServer(function() {


//	}).listen(4000);
