var fs = require('fs');

//var json = require('json');

var distroProxy = require('./distroProxy');
var distroServer = require('./distroServer');


var tracker;

// next step: telnet in & request file by name
var getTracker = function() {
  if (process.argv[2]) {
    localTracker = './' + process.argv[2];
    try {
    trackData = fs.readFileSync(localTracker, 'utf8');
    } catch (err) {
      console.log('tracker file ' + localTracker + ' not found!  Crashing now');
      throw err;
    }
    tracker = JSON.parse(trackData);
    
  } else {
    console.log("Usage: node distroweb.js <tracker>");
    process.exit();
    // implement fs as a socket to a remote server
  }    
}

var startup = function() {
    getTracker();
    console.log("Tracker is: " + tracker.peers[0][1]);
    console.log('tracker read, spinning up http server');
    distroProxy.startup();
    distroServer.startup();
  
}

startup();
