fs = require('fs');


var execute = function (hash, message) {
  if (message.action === 'read') {
    return readTracker(hash);
  } 
  // remove, update, ...?
}


var readTracker = function (hash) {
  try {
    content = fs.readFileSync('./source/' + hash);
  } catch (err) {
    console.log("Tracker:  " + hash + " not found, returning empty string");
    return "";
  }

  console.log("Tracker:  " + hash + " found"); 
  return content;
}



exports.execute = execute;
