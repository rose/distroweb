var http = require('http');
var fs = require('fs');
//console.log(http);

var staticFileHandler = function(path) {
	return function (res) {

		fs.readFile(path,'utf8',function(err, fileData){
			if (err) throw "File not found";
			res.writeHead(418,{'Content-Type':'text/html'});
			res.end(fileData);
		});
	};
};

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

var routes = {
	"/getthis": staticFileHandler("./nodeserver.js"),
	"/": staticFileHandler("./index.html"),
	"/bye": staticFileHandler("./bye.html"),
	"/time": function(res) {
		res.writeHead(418,{'Content-Type':'text/html'});
		res.end(new Date().getTime().toString());
	}
};

var notFound = function(res) {
	res.writeHead(404, {'Content-Type':"text/html"});
	res.end("404 Not Found");
}

var handler = function (req, res) {
	console.log("Incoming request from " + req.socket.remoteAddress);
  if (req.url.match(/^\/distroweb\/?/)) {
    distroReq = req.url.match(/^\/distroweb(.*)/)[1];
    distroHandler(distroReq)(res);
  }
  else if (req.url in routes) {
		routes[req.url](res);
	} else {
		notFound(res);
	}
};

http.createServer(handler).listen(4000);
//http.createServer(function() {


//	}).listen(4000);
