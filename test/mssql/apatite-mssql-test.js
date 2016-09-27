'use strict';

describe('ApatiteMssqlTest', function () {
    var ApatiteMssqlTestUtil = require('./apatite-mssql-test-util');
    var util = new ApatiteMssqlTestUtil();
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

        it('Mssql Validity', function (done) {
            helper.testFunction(done, session, util);
        });
    }
})

function doPoolTest() {
    describe('ApatiteMssqlPoolTest', function () {
        var ApatiteMssqlTestUtil = require('./apatite-mssql-test-util');
        var util = new ApatiteMssqlTestUtil();
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

            it('Mssql Connection Pool Validity', function (done) {
                helper.testFunction(done, session, util);
            });
        }
    })    
}


function doPoolErrorTest() {
    describe('ApatiteMssqlPoolErrorTest', function () {
        var ApatiteMssqlTestUtil = require('./apatite-mssql-test-util');
        var util = new ApatiteMssqlTestUtil();
        if (util.existsModule()) {
            var helper = require('../apatite-dialect-pool-error-test-helper.js');
            var session = null;
            before(function (done) {
                helper.setUp(done, util, function (sess) { session = sess; });
            });

            after(function (done) {
                helper.tearDown(done, util, session);
            });

            it('Mssql Connection Pool Error Validity', function (done) {
                helper.testFunction(done, session, util);
            });
        }
    })
}