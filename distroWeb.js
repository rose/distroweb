var distroProxy = require('./distroProxy');
var distroServer = require('./distroServer');
var distroTracker = require('./distroTracker');

var startup = function() {
  console.log("Welcome to distroWeb!  Spinning up servers...");
  // try catch block?
  distroProxy.startup();
  distroServer.startup();
  distroTracker.startup();
  console.log("All servers started ok");
}

startup();
