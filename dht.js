var net = require('net');

var tracker = require('./distroTracker');
var util = require('./utils');

var dhtPort = 54321;


var dhtHandler = function(conn) {
  req = '';

  conn.on('data', function(chunk) { 
    console.log("dht:  Received request chunk from " + conn.remoteAddress);
    req += chunk;
  });

  conn.on('end', function() {
    console.log("dht:  Track request received, looking for next hop...");

    // TODO this will be a JSON document with field for whether we are
    // looking for a dht or passing one back
    parseAndRoute(req, conn.remoteAddress);
    console.log("dht:  Done handling request, closing connection.");
  });
}


var parseAndRoute = function(incomingRequest, remoteAddress) {
  requestObject = JSON.parse(incomingRequest);
  if (requestObject.outbound) {
    sendOut(requestObject, remoteAddress);
  } else {
    sendBack(requestObject);
  }
}


var sendOut = function(request, remoteAddress) {
  request = addSelf(request, remoteAddress);
  peers = util.sortPeers(request.hash);
  checkNextPeer(peers, request, 0);
}


var sendBack = function(response) {
  if (response.ips === []) {
    // passdht(response.data)
    console.log("dht:  Received dht file! " + response.data);
    return 0;
  }

  var conn = net.createConnection(response.ports.pop(), response.ips.pop(), function() {
    conn.write(JSON.stringify(response));
    conn.end();
  });
 
  // TODO: maybe hop over broken connections on the way back?
}


var addSelf = function(requestObject, remoteAddress) {
  console.log("dht:  Adding self to request object");

  requestObject.ips.push(remoteAddress);
  requestObject.ports.push(dhtPort);
  return requestObject;
}


// checkNextPeer and tryConnecting are mutually recursive
// what would be better names?
// checkNextPeer checks whether we are the closest, and TODO if we are;
// else it calls tryConnecting
// tryConnecting makes a connection & calls checkNextPeer on timeout or error

var checkNextPeer = function(peers, request, nextPeer) {
  next = peers[nextPeer];
  console.log("dht:  Checking peer " + nextPeer + ": " + next);

  if (next.ip === 'localhost') {
    console.log("dht:  I am the closest to hash " + request.hash + "!");
    console.log("dht:  BOW DOWN BEFORE ME PEASANTS");
    request.ports.pop();
    request.outbound = false;
    request.data = tracker.execute(request.hash, request.message);
    sendBack(request);
    return 0;
  }

  tryConnecting(next, request, nextPeer);
}


var tryConnecting = function(peer, request, peerIndex) {
  console.log("dht:  Passing on request to " 
      + peer.key + " at " + peer.ip + ":" + peer.port);

  conn = net.createConnection(peer.port, peer.ip, function() {

    conn.setTimeout(2000, function() {
      checkNextPeer(peers, request, peerIndex + 1);
      // close connection, or replace checkNextPeer with thrown error
      conn.close();
    });

    conn.write(JSON.stringify(request));
    conn.close();
  });

  conn.on('err', function() {
    checkNextPeer(peers, request, peerIndex + 1);
  });
}


//Connection comes in on the dht port.
//It's either going out or coming in.
//Set an on 'data' handler to read the request into JSON, then parse it.
//If it's going out, push the remoteAddress onto ips and our port onto ports and send it out
//If it's going out and localhost is the closest, grab our dht data and put it in the object as a new field, set the direction flag to true and send it back
//If it's coming back, pop off port and pop off ip and send it there
//If it's coming back and ip is empty, pass the dht object to distroClient for consumption


var startup = function() {
  net.createServer({'allowHalfOpen': true}, dhtHandler).listen(dhtPort);
  console.log("dht:  Listening on port " + dhtPort);
}


var get = function(hash, callback) {
  update(hash, {'action': 'read'}, callback);
}


var update = function(hash, message, callback) {
  console.log("DHT:  Received get request for " + hash);

  var conn = net.createConnection(dhtPort, 'localhost', function() {
    console.log("DHT:  Connecting to localhost:" + dhtPort);
    request = util.makeTrackRequest(hash, message);
    conn.write(JSON.stringify(request));
    conn.end();
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
