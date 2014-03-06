var distroProxy = require('./distroProxy');
var distroServer = require('./distroServer');
var dht = require('./dht');

var startup = function() {
  console.log("Welcome to distroWeb!  Spinning up servers...");
  // try catch block?
  distroProxy.startup();
  distroServer.startup();
  dht.startup();
  console.log("All servers started ok");
}

startup();
