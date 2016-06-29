var ApatitePostgresTestUtil = require('./apatite-postgres-test-util');
var util = new ApatitePostgresTestUtil();

describe('ApatitePostgresTest', function () {
    if (util.existsModule()) {
        var helper = require('../apatite-dialect-test-helper.js');
        var session = null;
        before(function (done) {
            helper.setUp(done, util, function (sess) { session = sess; });
        });

        after(function (done) {
            helper.tearDown(done, util, session);
        });

        it('Postgres Validity', function (done) {
            helper.testFunction(done, session, util);
        });
    }
})

describe('ApatitePostgresPoolTest', function () {
    if (util.existsModule()) {
        var helper = require('../apatite-dialect-pool-test-helper.js');
        var session = null;
        before(function (done) {
            helper.setUp(done, util, function (sess) { session = sess; });
        });

        after(function (done) {
            helper.tearDown(done, util, session);
        });

        it('Postgres Connection Pool Validity', function (done) {
            helper.testFunction(done, session, util);
        });
    }
})