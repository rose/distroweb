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

var redirectToDistroweb = function() {
	return function (res) {
		res.writeHead(301,{'Location':'/distroweb'});
		res.end();
	}
}

var hackerSchoolRequest = {
	hostname:"www.reddit.com",
	port:80
};


var hsreq = function() {
	return function (res) {
		var hsRequest = http.request(hackerSchoolRequest, function(hsres) {
			hsres.on('data', function(theData) {
			  // regex: /(<[^<>]+\")(\/[^<>])/ becomes match[1] + hackerSchoolRequest.hostname + hsres.url + match[2]
        res.write(theData);
			});		
		});
		hsRequest.write("");
		hsRequest.end();
	};
}

var routes = {
	//"/getthis": staticFileHandler("./nodeserver.js"),
	"/": redirectToDistroweb(),
	//"/bye": staticFileHandler("./bye.html"),
	"/hackerSchool": hsreq(),
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
  if (req.url.match(/^\/distroweb(\/|$)/)) {
    distroReq = req.url.match(/^\/distroweb(.*)/)[1];
    distroHandler(distroReq)(res);
    console.log("distroweb request: " + distroReq);
  }
  else if (req.url in routes) {
		routes[req.url](res);
    console.log("alternate route: " + req.url);
	} else {
		notFound(res);
    console.log("route not found: " + req.url);
	}
};

http.createServer(handler).listen(80);
//http.createServer(function() {


//	}).listen(4000);
