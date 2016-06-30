'use strict';

var ApatiteConnection = require('../apatite-connection.js');
var ApatiteError = require('../../error/apatite-error');

var ApatiteUtil = require('../../util.js');
var pgModuleName = 'pg';
var pg;

if (ApatiteUtil.existsModule(pgModuleName)) // must be checked otherwise would get test discovery error for mocha tests in VS
    pg = require(pgModuleName);

class ApatitePostgresConnection extends ApatiteConnection {
    constructor(dialect) {
        super(dialect);
        this.poolEndConnCallback = null;
    }

    static getModuleName() {
        return pgModuleName;
    }

    static createNewPool(configOpts) {
        return new pg.Pool(configOpts)
    }
    basicConnect(onConnected) {
        var connectionOptions = this.dialect.connectionOptions;
        var connStr = `postgres://${connectionOptions.userName}:${connectionOptions.password}@${connectionOptions.connectionInfo}`;
        var self = this;
        if (this.dialect.useConnectionPool) {
            self.dialect.connectionPool.connect(function(err, client, done) {
                self.databaseConnection = client;
                self.poolEndConnCallback = done;
                if (err) {
                    done(err); // could not successfully write test case
                }
                onConnected(err);
            });
        } else {
            this.databaseConnection = new pg.Client(connStr);
            this.databaseConnection.connect(function (err) {
                if (err) {
                    self.disconnect(function (disconnErr) {
                        onConnected(err);
                    });
                } else
                    onConnected(err);
            });
        }
    }

    setStatementResult(sqlStatement, result) {
        if (result)
            sqlStatement.setSQLResult(result.rows);
    }

    basicBeginTransaction(onTransactionBegan) {
        this.basicExecuteTransactionQuery('BEGIN', onTransactionBegan);
    }

    basicCommitTransaction(onTransactionCommitted) {
        this.basicExecuteTransactionQuery('COMMIT', onTransactionCommitted);
    }

    basicRollbackTransaction(onTransactionRollbacked) {
        this.basicExecuteTransactionQuery('ROLLBACK', onTransactionRollbacked);
    }

    basicExecuteTransactionQuery(transQueryStr, onExecuted) {
        var self = this;
        this.setDBConnection(function (connErr) {
            self.databaseConnection.query(transQueryStr, function (err, result) {
                onExecuted(err);
            });
        });
    }

    basicDisconnect(onDisconnected) {
        if (this.dialect.useConnectionPool) {
            if (this.poolEndConnCallback) {
                this.poolEndConnCallback();
                this.poolEndConnCallback = null;
            }
        }
        else if (this.databaseConnection) {
            this.databaseConnection.end();
        }
        onDisconnected(null);
    }

    basicExecuteSQLString(sqlStr, bindings, onExecuted) {
        var self = this;
        this.setDBConnection(function(connErr) {
            if (connErr) {
                self.onSQLExecuted(connErr, null, onExecuted);
                return;
            }
            self.databaseConnection.query(sqlStr, bindings, function (err, result) {
                self.onSQLExecuted(err, result, onExecuted);
            });
        });
    }
}

module.exports = ApatitePostgresConnection;