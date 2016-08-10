describe('ApatiteMysqlTest', function () {
    var ApatiteMysqlTestUtil = require('./apatite-mysql-test-util');
    var util = new ApatiteMysqlTestUtil();
    if (util.existsModule()) {
        var helper = require('../apatite-dialect-test-helper.js');
        var session = null;
        before(function (done) {
            helper.setUp(done, util, function (sess) { session = sess; });
        });

        after(function (done) {
            helper.tearDown(done, util, session);
            doPoolTest();
        });

        it('Mysql Validity', function (done) {
            helper.testFunction(done, session, util);
        });
    }
})

function doPoolTest() {
    describe('ApatiteMysqlPoolTest', function () {
        var ApatiteMysqlTestUtil = require('./apatite-mysql-test-util');
        var util = new ApatiteMysqlTestUtil();
        if (util.existsModule()) {
            var helper = require('../apatite-dialect-pool-test-helper.js');
            var session = null;
            before(function (done) {
                helper.setUp(done, util, function (sess) { session = sess; });
            });

            after(function (done) {
                helper.tearDown(done, util, session);
                doPoolErrorTest();
            });

            it('Mysql Connection Pool Validity', function (done) {
                helper.testFunction(done, session, util);
            });
        }
    })    
}

function doPoolErrorTest() {
    describe('ApatiteMysqlPoolErrorTest', function () {
        var ApatiteMysqlTestUtil = require('./apatite-mysql-test-util');
        var util = new ApatiteMysqlTestUtil();
        if (util.existsModule()) {
            var helper = require('../apatite-dialect-pool-error-test-helper.js');
            var session = null;
            before(function (done) {
                helper.setUp(done, util, function (sess) { session = sess; });
            });

            after(function (done) {
                helper.tearDown(done, util, session);
            });

            it('Mysql Connection Pool Error Validity', function (done) {
                helper.testFunction(done, session, util);
            });
        }
    })
}