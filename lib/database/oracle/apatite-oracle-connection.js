'use strict';

var ApatiteConnection = require('../apatite-connection.js');
var ApatiteError = require('../../error/apatite-error');
var ApatiteCursor = require('../apatite-cursor.js');
var ApatiteUtil = require('../../util.js');
var oracleModuleName = 'oracledb';
var oracledb;

if (ApatiteUtil.existsModule(oracleModuleName)) {// must be checked otherwise would get test discovery error for mocha tests in VS
    oracledb = require(oracleModuleName);
    oracledb.outFormat = oracledb.OBJECT;
}

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

    basicConnect(onConnected) {
        if (this.dialect.useConnectionPool)
            this.basicNewConnect(this.dialect.connectionPool, null, onConnected);
        else
            this.basicNewConnect(oracledb, this.dialect.buildConnOptions(), onConnected);
    }

    basicNewConnect(oraDBOrPool, oraConnOpts, onConnected) {
        var self = this;
        var onConnectedFunc = function (err, conn) {
            if (err) {
                onConnected(err);
                return;
            }
            self.databaseConnection = conn;
            onConnected(null);
        }
        if (oraConnOpts)
            oraDBOrPool.getConnection(oraConnOpts, onConnectedFunc);
        else
            oraDBOrPool.getConnection(onConnectedFunc);
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

    basicBeginTransaction(onTransactionBegan) {
        onTransactionBegan(null);
    }

    basicCommitTransaction(onTransactionCommitted) {
        this.databaseConnection.commit(function (err) {
            onTransactionCommitted(err);
        });
    }

    basicRollbackTransaction(onTransactionRollbacked) {
        this.databaseConnection.rollback(function (err) {
            onTransactionRollbacked(err);
        });
    }

    basicDisconnect(onDisconnected) {
        if (this.databaseConnection) {
            this.databaseConnection.release(function (err) {
                onDisconnected(err);
            });
        }
        else
            onDisconnected(null);
    }

    getOptionsForStatment(sqlStatement) {
        if (sqlStatement.isSelect())
            return { resultSet: true };
        else
            return super.getOptionsForStatment(sqlStatement);
    }

    basicExecuteSQLString(sqlStr, bindVariables, onExecuted, options) {
        var self = this;
        var bindings = {};
        for (var i = 0; i < bindVariables.length; i++) {
            bindings[bindVariables[i].getVariableName().slice(1)] = bindVariables[i].variableValue;
        }
        this.setDBConnection(function(connErr) {
            if (connErr) {
                self.onSQLExecuted(connErr, null, onExecuted);
                return;
            }
            if (options) {
                self.databaseConnection.execute(sqlStr, bindings, options, function (err, result) {
                    if (err) {
                        self.onSQLExecuted(err, result, onExecuted);
                        return;
                    }
                    if (options.isApatiteDirectSql)
                    {
                        self.dialect.getApatiteResultSet(result).fetchAllRows(function (resultSetErr, rows) {
                            if (resultSetErr)
                                self.onSQLExecuted(resultSetErr, result, onExecuted);
                            else
                                self.onSQLExecuted(null, {rows: rows}, onExecuted);
                        });
                    }
                    else
                        self.onSQLExecuted(err, result, onExecuted, options);
                });
            }
            else {
                self.databaseConnection.execute(sqlStr, bindings, function (err, result) {
                    self.onSQLExecuted(err, result, onExecuted);
                });
            }
        });
    }


}

module.exports = ApatiteOracleConnection;