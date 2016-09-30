'use strict';
var expect = require('chai').expect;

describe('ApatiteOracleTest', function () {
    var ApatiteOracleTestUtil = require('./apatite-oracle-test-util');
    var util = new ApatiteOracleTestUtil();
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
            helper.testFunction(function() {
                helper.failSQLTest(function(){
                    doConnResultSetFailTests(done, session);
                }, session, util)
            }, session, util);
        });
    }
});

function doConnResultSetFailTests(done, session) {
    var ApatiteOracleDialect = require('../../lib/database/oracle/apatite-oracle-dialect.js');
    var resultSet = new ApatiteOracleDialect().getApatiteResultSet({resultSet: {
        getRows: function(recSetSize, onFetched) {
            onFetched(new Error('Failed to get rows.'));
        },
        close: function(onClosed) {
            onClosed(null);
        }
    }});
    var sqlOptions = { isApatiteDirectSql: true, resultSet: true };
    var onExecuted = function(err, result) {
        expect(err.message).to.equal('Failed to get rows.');
        doResultSetTests(done);
    }
    session.connection.testResultSet = resultSet;
    session.connection.executeSQLString('select * from DEPT', [], onExecuted, sqlOptions);
}

function doResultSetTests(done) {
    var ApatiteOracleDialect = require('../../lib/database/oracle/apatite-oracle-dialect.js');
    var resultSet = new ApatiteOracleDialect().getApatiteResultSet({rows: []});
    resultSet.fetchRecords(function(err, rows) {
        expect(err).to.not.exist;
        expect(rows.length).to.equal(0);
        resultSet.closeResultSet(function(closeErr) {
            expect(closeErr).to.not.exist;
            doResultSetFailTests(done)
        })
    });
}

function doResultSetFailTests(done) {
    var ApatiteOracleDialect = require('../../lib/database/oracle/apatite-oracle-dialect.js');
    var resultSet = new ApatiteOracleDialect().getApatiteResultSet({resultSet: {
        getRows: function(recSetSize, onFetched) {
            onFetched(new Error('Failed to get rows.'));
        },
        close: function(onClosed) {
            onClosed(null);
        }
    }});
    resultSet.fetchAllRows(function(err, rows) {
        expect(err.message).to.equal('Failed to get rows.');
        doResultSetCloseFailTests(done);
    });
}

function doResultSetCloseFailTests(done) {
    var ApatiteOracleDialect = require('../../lib/database/oracle/apatite-oracle-dialect.js');
    var resultSet = new ApatiteOracleDialect().getApatiteResultSet({resultSet: {
        getRows: function(recSetSize, onFetched) {
            onFetched(null, []);
        },
        close: function(onClosed) {
            onClosed(new Error('Failed to close result set.'));
        }
    }});
    resultSet.fetchAllRows(function(err, rows) {
        expect(err.message).to.equal('Failed to close result set.');
        done();
    });
}

describe('ApatiteOraclePoolTest', function () {
    var ApatiteOracleTestUtil = require('./apatite-oracle-test-util');
    var util = new ApatiteOracleTestUtil();
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

describe('ApatiteOraclePoolErrorTest', function () {
    var ApatiteOracleTestUtil = require('./apatite-oracle-test-util');
    var util = new ApatiteOracleTestUtil();
    if (util.existsModule()) {
        var helper = require('../apatite-dialect-pool-error-test-helper.js');
        var session = null;
        before(function (done) {
            helper.setUp(done, util, function (sess) { session = sess; });
        });

        after(function (done) {
            helper.tearDown(done, util, session);
        });

        it('Oracle Connection Pool Error Validity', function (done) {
            helper.testFunction(done, session, util);
        });
    }
})