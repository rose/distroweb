dht = require('./dht');

dht.startup();

console.log("********************");
console.log("TESTING:  get FFFF00");
console.log("********************");
dht.get('c0ffea', console.log);

// console.log("********************");
// console.log("TESTING:  get FF00FF");
// console.log("********************");
// dht.get('ff00ff', console.log);

// console.log("********************");
// console.log("TESTING:  get FFFFFF");
// console.log("********************");
// dht.get('ff00ff', console.log);

