var http = require('http');
var distroClient = require('./distroClient')
var browserPort = 1234; // will be 80 someday!


var browserHandler = function (req, res) {
	console.log("Incoming request from " + req.socket.remoteAddress);
  if (req.url.match(/^\/distroweb(\/|$)/)) {
    distroReq = req.url.match(/^\/distroweb(.*)/)[1];
    console.log("DistroWeb request: " + distroReq);
    // TODO security!  check that they are not requesting .. or anything else unsavoury

    distroClient.getLatest(distroReq, res); // idObject { ip:, port:, hash: }
    
    
  } else {
    console.log("WWW request: " + req.url);
    redirectToWeb(req.url, res);
	}
};

var startup = function() {
	http.createServer(browserHandler).listen(browserPort);
}

var redirectToWeb = function(url, res) {
  res.writeHead(301, { 'Location' : "http:/" + url}); // url already starts with a /, and yes I'm a horrible human being.
  res.end();
}

exports.startup = startup;