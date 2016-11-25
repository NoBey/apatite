'use strict';

describe('ApatiteSqliteTest', function () {
    var ApatiteSqliteTestUtil = require('./apatite-sqlite-test-util');
    var util = new ApatiteSqliteTestUtil();
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

        it('Sqlite Validity', function (done) {
            helper.testFunction(done, session, util);
        });
    }
})

function doPoolTest() {
    describe('ApatiteSqlitePoolTest', function () {
        var ApatiteSqliteTestUtil = require('./apatite-sqlite-test-util');
        var util = new ApatiteSqliteTestUtil();
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

            it('Sqlite Connection Pool Validity', function (done) {
                helper.testFunction(done, session, util);
            });
        }
    })    
}

function doPoolErrorTest() {
    describe('ApatiteSqlitePoolErrorTest', function () {
        var ApatiteSqliteTestUtil = require('./apatite-sqlite-test-util');
        var util = new ApatiteSqliteTestUtil();
        if (util.existsModule()) {
            var helper = require('../apatite-dialect-pool-error-test-helper.js');
            var session = null;
            before(function (done) {
                helper.setUp(done, util, function (sess) { session = sess; });
            });

            after(function (done) {
                helper.tearDown(done, util, session);
            });

            it('Sqlite Connection Pool Error Validity', function (done) {
                helper.testFunction(done, session, util);
            });
        }
    })
}