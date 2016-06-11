'use strict';

var ApatiteConnection = require('../apatite-connection.js');
var ApatiteError = require('../../error/apatite-error');

var ApatiteUtil = require('../../util.js');
var pgModuleName = 'pg';
var PostgresClient;

if (ApatiteUtil.existsModule(pgModuleName)) // must be checked otherwise would get test discovery error for mocha tests in VS
    PostgresClient = require(pgModuleName).Client;

class ApatitePostgresConnection extends ApatiteConnection {
    constructor(dialect) {
        super(dialect);
    }

    static getModuleName() {
        return pgModuleName;
    }

    basicConnect(connectionOptions, onConnected) {
        var connStr = `postgres://${connectionOptions.userName}:${connectionOptions.password}@${connectionOptions.connectionInfo}`;
        this.databaseConnection = new PostgresClient(connStr);
        this.databaseConnection.connect(function (err) {
            onConnected(err);
        });
    }

    setStatementResult(sqlStatement, result) {
        if (result)
            sqlStatement.setSQLResult(result.rows);
    }

    beginTransaction(onTransactionBegan) {
        this.databaseConnection.query('BEGIN', function (err, result) {
            onTransactionBegan(err);
        });
    }

    commitTransaction(onTransactionCommitted) {
        this.databaseConnection.query('COMMIT', function (err, result) {
            onTransactionCommitted(err);
        });
    }

    rollbackTransaction(onTransactionRollbacked) {
        this.databaseConnection.query('ROLLBACK', function (err, result) {
            onTransactionRollbacked(err);
        });
    }

    basicDisconnect(onDisconnected) {
        this.databaseConnection.end();
        onDisconnected(null);
    }

    basicExecuteSQLString(sqlStr, bindings, onExecuted) {
        this.databaseConnection.query(sqlStr, bindings, function (err, result) {
            onExecuted(err, result);
        });
    }
}

module.exports = ApatitePostgresConnection;