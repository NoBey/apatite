var expect = require('chai').expect;

module.exports.setUp = function (done, util, onSetupFinished) {
    //this.timeout(5000);
    util.apatite.useConnectionPool();

    var connOptions = util.apatite.dialect.connectionOptions;
    var oriUserName = connOptions.userName;
    connOptions.userName = 'foo_and_bar';
    util.createTestTablesForPool(function (err) {
        expect(err).to.exist;
        onSetupFinished(null);
        done();
    });
}

module.exports.tearDown = function (done, util, session) {
    done();
}

module.exports.testFunction = function (done, session, util) {
    done();
}