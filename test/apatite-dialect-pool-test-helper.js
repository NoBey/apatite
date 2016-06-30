var expect = require('chai').expect;

module.exports.setUp = function (done, util, onSetupFinished) {
    //this.timeout(5000);
    util.apatite.useConnectionPool();

    util.createTestTablesForPool(function (createTablesErr) {
        expect(createTablesErr).to.not.exist;
        util.newSession(function (sessErr, sess) {
            expect(sessErr).to.not.exist;
            onSetupFinished(sess);
            done();
        });
    });

}

module.exports.tearDown = function (done, util, session) {
    //this.timeout(5000);

    util.deleteTestTablesForPool(function (err) {
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
    expect(session.connection.databaseConnection).to.not.exist; // should exist only when executing the sql
    done();
}