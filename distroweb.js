var http = require('http');
var net = require('net');

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

var redirectToWeb = function(url, res) {
  res.writeHead(301, { 'Location' : "http:/" + url}); // url already starts with a /, and yes I'm a horrible human being.
  res.end();
}

var handler = function (req, res) {
	console.log("Incoming request from " + req.socket.remoteAddress);
  if (req.url.match(/^\/distroweb(\/|$)/)) {
    distroReq = req.url.match(/^\/distroweb(.*)/)[1];
    console.log("DistroWeb request: " + distroReq);
    distroHandler(distroReq)(res);
  } else {
    console.log("WWW request: " + req.url);
    redirectToWeb(req.url, res);
	}
};

http.createServer(handler).listen(1234);
//http.createServer(function() {


//	}).listen(4000);
