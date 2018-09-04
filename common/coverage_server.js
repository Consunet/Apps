const path = require("path")
const coverage = require('istanbul-middleware');
const express = require('express');


exports.startCoverageServer = function() {
    var app = express();

    //const isCollectCoverage = process.env.COLLECT_COVERAGE === 'yes';
    const isCollectCoverage = true;

    if (isCollectCoverage) {
        app.use(express.static(path.join(__dirname, 'public-coverage')));
        app.use('/coverage', coverage.createHandler({ verbose: true, resetOnGet: true }));
    } else {
        app.use(express.static(path.join(__dirname, 'public')));
    }

    app.listen(8888);

    console.log('Express server listening on port ' + 8888);
}