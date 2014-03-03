dht = require('./dht');

dht.startup();

dht.get('ff00ff', console.log);
