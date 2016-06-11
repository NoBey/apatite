var ApatiteOracleTestUtil = require('./apatite-oracle-test-util');
var util = new ApatiteOracleTestUtil();
var helper = require('../apatite-dialect-test-helper.js');

describe('ApatiteOracleTest', function () {
    if (util.existsModule()) {
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