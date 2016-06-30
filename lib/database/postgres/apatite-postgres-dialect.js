'use strict';

var ApatiteDialect = require('../apatite-dialect.js');
var ApatitePostgresConnection = require('./apatite-postgres-connection.js');
var ApatitePostgresResultSet = require('./apatite-postgres-result-set.js');

class ApatitePostgresDialect extends ApatiteDialect {
    constructor(connectionOptions) {
        super(connectionOptions);
    }

    basicCreateConnectionPool(onPoolCreated) {
        this.connectionPool = ApatitePostgresConnection.createNewPool(this.buildConnOptions());
        onPoolCreated(null);
    }

    buildConnOptions() {
        var splitArr = this.connectionOptions.connectionInfo.split('/');
        return {
            user: this.connectionOptions.userName,
            password: this.connectionOptions.password,
            host: splitArr[0],
            database: splitArr[1],
            max: 10, // max number of clients in pool
            idleTimeoutMillis: 1000 // close & remove clients which have been idle > 1 second
        };
    }

    static getModuleName() {
        return ApatitePostgresConnection.getModuleName();
    }

    buildBindVariable(sqlBuilder) {
        return '$' + sqlBuilder.getNextBindVariableId();
    }

    newConnection() {
        return new ApatitePostgresConnection(this);
    }

    getApatiteResultSet(dbCursor) {
        return new ApatitePostgresResultSet(dbCursor);
    }
}


module.exports = ApatitePostgresDialect;