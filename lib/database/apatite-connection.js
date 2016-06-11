'use strict';

var ApatiteSubclassResponsibilityError = require('../error/apatite-subclass-responsibility-error.js');
var ApatiteCursor = require('./apatite-cursor.js');

class ApatiteConnection {
    constructor(dialect) {
        this.dialect = dialect;
        this.databaseConnection = null;
    }

    basicConnect(connectionOptions, onConnected) {
        throw new ApatiteSubclassResponsibilityError();
    }

    connect(connectionOptions, onConnected) {
        this.basicConnect(connectionOptions, onConnected);
    }

    basicDisconnect(onDisconnected) {
        throw new ApatiteSubclassResponsibilityError();
    }

    disconnect(onDisconnected) {
        return this.basicDisconnect(onDisconnected);
    }

    basicExecuteSQLString(sqlStr, bindings, onExecuted, options) {
        throw new ApatiteSubclassResponsibilityError();
    }

    getOptionsForStatment(sqlStatement) {
        return null;
    }

    logSql(sqlStr, bindings) {
        if (!this.dialect.apatite.loggingEnabled)
            return;

        console.log(`${new Date().toLocaleString()}: Executing SQL: ${sqlStr}, bindings: ${JSON.stringify(bindings)}.`);
    }

    executeSQLString(sqlStr, bindings, onExecuted, options) {
        this.logSql(sqlStr, bindings);
        this.basicExecuteSQLString(sqlStr, bindings, onExecuted, options);
    }

    executeSQLStatement(sqlStatement, onExecuted) {
        var self = this;
        this.executeSQLString(sqlStatement.sqlString, sqlStatement.bindings, function (err, result) {
            self.setStatementResult(sqlStatement, result);
            onExecuted(err, result);
        }, this.getOptionsForStatment(sqlStatement));
    }

    setStatementResult(sqlStatement, result) {
        if (!sqlStatement.isSelect())
            sqlStatement.setSQLResult(result);
    }

    beginTransaction(onTransactionBegan) {
        throw new ApatiteSubclassResponsibilityError();
    }

    commitTransaction(onTransactionCommitted) {
        throw new ApatiteSubclassResponsibilityError();
    }

    rollbackTransaction(onTransactionRollbacked) {
        throw new ApatiteSubclassResponsibilityError();
    }

    executeStatements(statements, onExecuted) {
        if (statements.length === 0) {
            onExecuted(null);
            return;
        }
        var stmt = statements.shift();
        var self = this;
        this.executeSQLStatement(stmt, function (err) {
            if (err) {
                onExecuted(err);
                return;
            }
            self.executeStatements(statements, onExecuted);
        });
    }
    executeStmtsInTransaction(statements, onExecuted) {
        var self = this;
        this.beginTransaction(function (beginTransErr) {
            if (beginTransErr) {
                onExecuted(beginTransErr);
                return;
            }
            var stmtsToExecute = [].concat(statements);
            self.executeStatements(stmtsToExecute, function (executionErr) {
                if (executionErr) {
                    self.rollbackTransaction(function (rollbackErr) {
                        if (rollbackErr)
                            onExecuted(rollbackErr);
                        else
                            onExecuted(executionErr);
                    });
                    return;
                }
                self.commitTransaction(function (commitErr) {
                    if (commitErr) {
                        self.rollbackTransaction(function (rollbackErr) {
                            if (rollbackErr)
                                onExecuted(rollbackErr);
                            else
                                onExecuted(commitErr);
                        });
                        return;
                    }
                    onExecuted(null);
                });
            });
        });
    }

    executeQuery(query, onExecuted) {
        var sqlBuilder = this.dialect.getSelectSQLBuilder(query);
        var self = this;

        this.executeSQLStatement(sqlBuilder.buildSQLStatement(), function (err, result) {
            if (err) {
                onExecuted(err, null);
                return;
            }
            var cursor = new ApatiteCursor(query, self.dialect.getApatiteResultSet(result));
            cursor.getAllResults(function (cursorErr, results) {
                onExecuted(cursorErr, results);
            });

        });
    }
}


module.exports = ApatiteConnection;