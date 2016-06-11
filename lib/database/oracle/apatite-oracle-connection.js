'use strict';

var ApatiteConnection = require('../apatite-connection.js');
var ApatiteError = require('../../error/apatite-error');
var ApatiteCursor = require('../apatite-cursor.js');
var ApatiteUtil = require('../../util.js');
var oracleModuleName = 'oracledb';
var oracledb;

if (ApatiteUtil.existsModule(oracleModuleName)) // must be checked otherwise would get test discovery error for mocha tests in VS
    oracledb = require(oracleModuleName);

class ApatiteOracleConnection extends ApatiteConnection {
    constructor(dialect) {
        super(dialect);
    }

    static getModuleName() {
        return oracleModuleName;
    }

    static getOracleDb() {
        return oracledb;
    }

    basicConnect(connectionOptions, onConnected) {
        var self = this;
        oracledb.outFormat = oracledb.OBJECT;
        var oraConnOpts = { user: connectionOptions.userName, password: connectionOptions.password, connectString: connectionOptions.connectionInfo };
        oracledb.getConnection(oraConnOpts, function (err, conn) {
            if (err) {
                onConnected(err);
                return;
            }
            self.databaseConnection = conn;
            onConnected(null);
        });
    }

    setStatementResult(sqlStatement, result) {
        if (result) {
            if (sqlStatement.isSelect()) {
                sqlStatement.setSQLResult(result.rows);
            }
            else {
                sqlStatement.setSQLResult(result.outBinds);
            }
        }
    }

    beginTransaction(onTransactionBegan) {
        onTransactionBegan(null);
    }

    commitTransaction(onTransactionCommitted) {
        this.databaseConnection.commit(function (err) {
            onTransactionCommitted(err);
        });
    }

    rollbackTransaction(onTransactionRollbacked) {
        this.databaseConnection.rollback(function (err) {
            onTransactionRollbacked(err);
        });
    }

    basicDisconnect(onDisconnected) {
        this.databaseConnection.release(function (err) {
            onDisconnected(err);
        });
    }

    getOptionsForStatment(sqlStatement) {
        if (sqlStatement.isSelect())
            return { resultSet: true };
        else
            return super.getOptionsForStatment(sqlStatement);
    }

    basicExecuteSQLString(sqlStr, bindings, onExecuted, options) {
        if (options) {
            var self = this;
            this.databaseConnection.execute(sqlStr, bindings, options, function (err, result) {
                if (err) {
                    onExecuted(err, result);
                    return;
                }
                if (options.isApatiteDirectSql)
                {
                    self.dialect.getApatiteResultSet(result).fetchAllRows(function (resultSetErr, rows) {
                        if (resultSetErr)
                            onExecuted(resultSetErr, result);
                        else
                            onExecuted(null, {rows: rows});
                    });
                }
                else
                    onExecuted(err, result);
            });
        }
        else {
            this.databaseConnection.execute(sqlStr, bindings, function (err, result) {
                onExecuted(err, result);
            });
        }
    }
}

module.exports = ApatiteOracleConnection;