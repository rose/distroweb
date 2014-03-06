var net = require('net');
var tracker = require('./distroTracker');


var tryConnecting = function(peer, request, peerIndex) {
  console.log("Tumour:  Passing on request to " 
      + peer.key + " at " + peer.ip + ":" + peer.port);

  var conn = net.createConnection(peer.port, peer.ip, function() {
    console.log("Tumour:  Created connection to " 
      + peer.key + " at " + peer.ip + ":" + peer.port);
    conn.write(JSON.stringify(request) + "distro");
  });

  conn.setTimeout(5000);

  var tryNextPeer = true;

  var response = ""

  conn.on('data', function(chunk) {
    response += chunk;
    if (response.substr(0,hashLen) == "distro") {
      console.log("Tumour:  Valid response from peer, will not try next");
      tryNextPeer = false;
    }
  });
  

  conn.on('timeout', function() {
    console.log("Tumour:  TIMEOUT!!!");

    if (tryNextPeer) {
      checkNextPeer(peers, request, peerIndex + 1);
      conn.end();
    }

    tryNextPeer = false;
  });

  conn.on('error', function(err) {
    console.log("Tumour:  ERROR!!! " + err.toString());

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
  console.log("Tumour:  Checking peer " + nextPeer + ": " + next.id + " at " + next.ip);

  if (next.ip === 'localhost') {
    console.log("Tumour:  I am the closest to hash " + request.hash + "!");
    console.log("Tumour:  BOW DOWN BEFORE ME PEASANTS");
    request.ports.pop();
    request.outbound = false;
    request.data = tracker.execute(request.hash, request.message);
    sendBack(request);
    return 0;
  }

  tryConnecting(next, request, nextPeer);
}


var execute = function (hash, message) {
  if (message.action === 'read') {
    return readTracker(hash);
  } 
  // remove, update, ...?
}


var readTracker = function (hash) {
  try {
    content = fs.readFileSync('./trackers/' + hash).toString();
  } catch (err) {
    console.log("Tracker:  " + hash + " not found, returning empty string");
    return "";
  }

  console.log("Tracker:  " + hash + " found"); 
  return content;
}



exports.execute = execute;

exports.processRequest = processRequest;


