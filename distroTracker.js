fs = require('fs');


var execute = function (hash, message) {
  if (message.action === 'read') {
    return readTracker(hash);
  } 
  // remove, update, ...?
}


var readTracker = function (hash) {
  fs.readFile('./source/' + hash, function(err, content) {
    if (err) {
      console.log("Tracker:  " + hash + " not found, returning empty string");
      return "";
    } else {
      console.log("Tracker:  " + hash + " found"); 
      return content;
    }
  });
}


exports.execute = execute;
