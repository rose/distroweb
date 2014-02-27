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

exports.hammingTable = makeHammingTable();
