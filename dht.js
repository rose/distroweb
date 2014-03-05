var net = require('net');

var tracker = require('./distroTracker');
var util = require('./utils');

var dhtPort = 54321;


var dhtHandler = function(conn) {
  req = '';

  conn.on('data', function(chunk) { 
    console.log("DHT:  Received request chunk " + chunk + " from " + conn.remoteAddress);
    req += chunk;
  });

  conn.on('err', function(err) {
    console.log(JSON.stringify(err));
  });

  conn.on('end', function() {
    console.log("DHT:  Track request received, looking for next hop...");

    // TODO this will be a JSON document with field for whether we are
    // looking for a dht or passing one back
    parseAndRoute(req, conn.remoteAddress);
  });
}


var parseAndRoute = function(incomingRequest, remoteAddress) {
  console.log("DHT:  Parsing " + incomingRequest);

  requestObject = JSON.parse(incomingRequest);
  if (requestObject.outbound) {
    sendOut(requestObject, remoteAddress);
  } else {
    sendBack(requestObject);
  }
}


var sendOut = function(request, remoteAddress) {
  console.log("DHT:  Sending request " + JSON.stringify(request));

  request = addSelf(request, remoteAddress);
  peers = util.sortPeers(request.hash);
  checkNextPeer(peers, request, 0);
}


var sendBack = function(response) {
  console.log("DHT:  Sending response " + JSON.stringify(response) + " TTL: " + response.ips.length );

  if (!response.ips.length) {
    // passdht(response.data)
    console.log("DHT:  Received dht file! " + response.data);
    return 0;
  }

  var conn = net.createConnection(response.ports.pop(), response.ips.pop(), function() {
    conn.write(JSON.stringify(response));
    conn.end();
  });
 
  // TODO: maybe hop over broken connections on the way back?
}


var addSelf = function(requestObject, remoteAddress) {
  console.log("DHT:  Adding self to request object");

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
  console.log("DHT:  Checking peer " + nextPeer + ": " + next.id + " at " + next.ip);

  if (next.ip === 'localhost') {
    console.log("DHT:  I am the closest to hash " + request.hash + "!");
    console.log("DHT:  BOW DOWN BEFORE ME PEASANTS");
    request.ports.pop();
    request.outbound = false;
    request.data = tracker.execute(request.hash, request.message);
    sendBack(request);
    return 0;
  }

  tryConnecting(next, request, nextPeer);
}


var tryConnecting = function(peer, request, peerIndex) {
  console.log("DHT:  Passing on request to " 
      + peer.key + " at " + peer.ip + ":" + peer.port);

  var conn = net.createConnection(peer.port, peer.ip, function() {
    console.log("DHT:  Created connection to " 
      + peer.key + " at " + peer.ip + ":" + peer.port);
    conn.write(JSON.stringify(request));
  });

  conn.setTimeout(10000);

  var triedNext = false;

  /* handshake later?

     conn.on('data', function(chunk) {
     if (chunk != peer.key) {
     console.log("DHT:  Invalid response from peer, trying next");
     checkNextPeer(peers, request, peerIndex + 1);
     }
     });
  */

  conn.on('timeout', function() {
    console.log("DHT:  TIMEOUT!!!");

    if (!triedNext) {
      checkNextPeer(peers, request, peerIndex + 1);
      conn.end();
    }

    triedNext = true;
  });

  conn.on('error', function(err) {
    console.log("DHT:  ERROR!!! " + err.toString());

    if (!triedNext) {
      checkNextPeer(peers, request, peerIndex + 1);
    }

    triedNext = true;
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
  console.log("DHT:  Listening on port " + dhtPort);
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
