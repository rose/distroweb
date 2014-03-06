var net = require('net');

var tracker = require('./distroTracker');
var util = require('./utils');
var tumour = require('./tumour');


var dhtHandler = function(conn) {
  req = '';
  
  conn.write("flying");
  
  conn.on('data', function(chunk) { 
    console.log("DHT:  Received request chunk " + chunk + " from " + conn.remoteAddress);
    req += chunk;
    if (req.match(/.*circus$/)) {
      console.log("Circus found!");
      req = req.substr(0,req.length-6);     
      parseAndRoute(req,conn);
      conn.end();
    }

  });
  
  conn.on('err', function(err) {
    console.log(JSON.stringify(err));
  });

  conn.on('end', function() {
    // console.log("DHT:  Track request received, looking for next hop...");

    // TODO this will be a JSON document with field for whether we are
    // looking for a dht or passing one back
    // parseAndRoute(req, conn.remoteAddress);
  });
}


var parseAndRoute = function(incomingRequest, conn) {
  console.log("DHT:  Parsing " + incomingRequest);

  requestObject = JSON.parse(incomingRequest);
  if (requestObject.outbound) {
    sendOut(requestObject, conn.remoteAddress);
  } else {
    sendBack(requestObject);
  }
}


var sendOut = function(request, remoteAddress) {
  console.log("DHT:  Sending request " + JSON.stringify(request));

  request = addSelf(request, remoteAddress);
  peers = util.sortPeers(request.hash);
  tumour.processRequest(peers, request);
}


var sendBack = function(response) {
  console.log("DHT:  Sending response " + JSON.stringify(response) + " TTL: " + response.ips.length );
  
  if (!response.ips.length) {
    // passdht(response.data)
    console.log("DHT:  Received dht file! " + response.data);
  } else {
    var conn = net.createConnection(response.ports.pop(), response.ips.pop(), function() {
      conn.write(JSON.stringify(response) + "circus");
      conn.end();
    });
  }
  // TODO: maybe hop over broken connections on the way back?
}


var addSelf = function(requestObject, remoteAddress) {
  console.log("DHT:  Adding self to request object");

  requestObject.ips.push(remoteAddress);
  requestObject.ports.push(util.dhtPort);
  return requestObject;
}


var startup = function() {
  dhtServer = net.createServer({'allowHalfOpen': true}, dhtHandler).listen(util.dhtPort);
  console.log("DHT:  Listening on port " + util.dhtPort);
}


var get = function(hash, callback) {
  update(hash, {'action': 'read'}, callback);
}


var update = function(hash, message, callback) {
  console.log("DHT:  Received get request for " + hash);

  var conn = net.createConnection(util.dhtPort, 'localhost', function() {
    console.log("DHT:  Connecting to localhost:" + util.dhtPort);
    request = util.makeTrackRequest(hash, message);
    conn.write(JSON.stringify(request) + "circus");
  });

  response = '';

  conn.on('data', function(chunk) {
    response += chunk;
  });

  conn.on ('end', function() {
    console.log("DHT:  Get received response, passing to callback");
    callback(response);
  });
}


exports.startup = startup;
exports.get = get;
exports.update = update;
