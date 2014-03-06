var net = require('net');

var tryConnecting = function(peer, request, peerIndex) {
  console.log("DHT:  Passing on request to " 
      + peer.key + " at " + peer.ip + ":" + peer.port);

  var conn = net.createConnection(peer.port, peer.ip, function() {
    console.log("DHT:  Created connection to " 
      + peer.key + " at " + peer.ip + ":" + peer.port);
    conn.write(JSON.stringify(request) + "distro");
  });

  conn.setTimeout(5000);

  var tryNextPeer = true;

  var response = ""

  conn.on('data', function(chunk) {
    response += chunk;
    if (response.substr(0,hashLen) == "distro") {
      console.log("DHT:  Valid response from peer, will not try next");
      tryNextPeer = false;
    }
  });
  

  conn.on('timeout', function() {
    console.log("DHT:  TIMEOUT!!!");

    if (tryNextPeer) {
      checkNextPeer(peers, request, peerIndex + 1);
      conn.end();
    }

    tryNextPeer = false;
  });

  conn.on('error', function(err) {
    console.log("DHT:  ERROR!!! " + err.toString());

    if (tryNextPeer) {
      checkNextPeer(peers, request, peerIndex + 1);
    }

    tryNextPeer = false;
  });
}


var processRequest = function(peers, request) {
  checkNextPeer(peers, request, 0);
}


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

