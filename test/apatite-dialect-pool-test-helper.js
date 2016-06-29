var expect = require('chai').expect;

module.exports.setUp = function (done, util, onSetupFinished) {
    //this.timeout(5000);
    util.apatite.useConnectionPool();
    util.createTestTables(function (err) {
        expect(err).to.not.exist;
        util.newSession(function (sessErr, sess) {
            expect(sessErr).to.not.exist;
            onSetupFinished(sess);
            done();
        });
    });
}

module.exports.tearDown = function (done, util, session) {
    //this.timeout(5000);
    util.deleteTestTables(function (err) {
        expect(err).to.not.exist;
        session.end(function (endErr) {
            expect(endErr).to.not.exist;
            util.apatite.closeConnectionPool(function(connErr) {
                expect(connErr).to.not.exist;
                done();
            });
        });
    });
}

module.exports.testFunction = function (done, session, util) {
    var query = util.newQueryForDepartment(session);
    var sqlOptions = { isApatiteDirectSql: true, resultSet: true };
    expect(session.connection.databaseConnection).to.not.exist; // should exist only when executing the sql
    session.execute(query, function (err, departments) {
        expect(session.connection.databaseConnection).to.not.exist;
        expect(departments.length).to.equal(0);
        done();
    });
}