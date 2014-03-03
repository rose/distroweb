fs = require('fs');

var makeHammingTable = function() {
  var foo = '0123456789abcdef';
  var table = {};
  for (i = 0; i < 16; i++) {
    for (j = 0; j < 16; j++) {
      table[[foo[i],foo[j]]] = distance(i,j);
    }
  }
  return table;
}

var distance = function(m,n) {
  // does not work on negative numbers!
  sum = 0;
  for (bits = m^n; bits > 0; bits = bits >> 1) {
    sum += bits & 1;
  }
  return sum;
}

var sortPeers = function (hash) {
  // return a list of addr, port, status of seeds & peers for this hash.
  peerString = fs.readFileSync('./peers');
  var peers = JSON.parse(peerString);
  
  peers.sort( function(p1,p2) {
    //return Math.abs(hash - p1.key) - Math.abs(hash - p2.key);
    return shaDistance(hash, p1.key) - shaDistance(hash, p2.key);
  });

  console.log(peers);
  return peers;
}


var makeTrackRequest = function(hash, message) {
  request = {
    'message': message,
    'ports': [54321],
    'ips': [],
    'outbound': true,
    'hash': hash,
    'data': ''
  };
  return request;
}


var shaDistance = function(sha, key) {
  sum = 0;
  for (i = 0; i < sha.length; i++) {
    sum += hammingTable[[sha[i], key[i]]];
  }
  return sum;
}

hammingTable = makeHammingTable();

exports.sortPeers = sortPeers;
exports.makeTrackRequest = makeTrackRequest;
