var http = require('http');
var util = require('./utils');
var dht = require('./dht');
var browserPort = 1234; // will be 80 someday!


var browserHandler = function (req, res) {
	console.log("Proxy:  Incoming request from " + req.socket.remoteAddress);
  if (req.url.match(/^\/distroweb(\/|$)/)) {
    distroReq = req.url.match(/^\/distroweb(.*)/)[1];
    console.log("Proxy:  DistroWeb request: " + distroReq);
    //util.makeTrackRequest(distroReq.substr(1));
    dht.get(distroReq.substr(1), function(returnedPage) {
      res.writeHead(200, { "Content-Type":"text/html"});
      res.write(returnedPage);
      res.end();
    });
  } else {
    console.log("Proxy: WWW request: " + req.url);
    redirectToWeb(req.url, res);
	}
};

var redirectToWeb = function(url, res) {
  res.writeHead(301, { 'Location' : "http:/" + url}); // url already starts with a /, and yes I'm a horrible human being.
  res.end();
}

var startup = function() {
	http.createServer(browserHandler).listen(browserPort);
  console.log("Proxy:  Listening on port " + browserPort);
}

exports.startup = startup;
