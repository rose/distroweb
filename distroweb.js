var fs = require('fs');

//var json = require('json');

var distroProxy = require('./distroProxy');
var distroServer = require('./distroServer');


var tracker;

// next step: telnet in & request file by name

var startup = function() {
  fs.readFile('./tracker.json', function (err, trackData) {
    if (err) {
      console.log('tracker.json not found!  Crashing now');
      throw err;
    }; 

    tracker = JSON.parse(trackData);
    console.log("Tracker is: " + tracker.peers[0][1]);
    console.log('tracker read, spinning up http server');
    distroProxy.startup();
    distroServer.startup();
  });
}

startup();
