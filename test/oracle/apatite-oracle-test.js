var ApatiteOracleTestUtil = require('./apatite-oracle-test-util');
var util = new ApatiteOracleTestUtil();

describe('ApatiteOracleTest', function () {
    if (util.existsModule()) {
        var helper = require('../apatite-dialect-test-helper.js');
        var session = null;
        before(function (done) {
            helper.setUp(done, util, function (sess) { session = sess; });
        });

        after(function (done) {
            helper.tearDown(done, util, session);
        });

        it('Oracle Validity', function (done) {
            helper.testFunction(done, session, util);
        });
    }
})

describe('ApatiteOraclePoolTest', function () {
    if (util.existsModule()) {
        var helper = require('../apatite-dialect-pool-test-helper.js');
        var session = null;
        before(function (done) {
            helper.setUp(done, util, function (sess) { session = sess; });
        });

        after(function (done) {
            helper.tearDown(done, util, session);
        });

        it('Oracle Connection Pool Validity', function (done) {
            helper.testFunction(done, session, util);
        });
    }
})