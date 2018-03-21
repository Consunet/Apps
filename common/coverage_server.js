var coverage = require('istanbul-middleware');
var express = require('express');
var app = express();

app.use('/coverage', coverage.createHandler({ verbose: true, resetOnGet: true }));

app.listen(8888);

console.log('Express server listening on port ' + 8888);