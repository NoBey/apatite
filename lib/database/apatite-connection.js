'use strict';

var ApatiteSubclassResponsibilityError = require('../error/apatite-subclass-responsibility-error.js');
var ApatiteCursor = require('./apatite-cursor.js');

class ApatiteConnection {
    constructor(dialect) {
        this.dialect = dialect;
        this.databaseConnection = null;
        this.isTransactionInProgress = false;
        this.queryInProgress = false;
    }

    basicConnect(onConnected) {
        throw new ApatiteSubclassResponsibilityError();
    }

    connect(onConnected) {
        this.basicConnect(onConnected);
    }

    basicDisconnect(onDisconnected) {
        throw new ApatiteSubclassResponsibilityError();
    }

    disconnect(onDisconnected) {
        var self = this;
        this.basicDisconnect(function (err) {
            self.databaseConnection = null;
            onDisconnected(err);
        });
    }

    basicExecuteSQLString(sqlStr, bindings, onExecuted, options) {
        throw new ApatiteSubclassResponsibilityError();
    }

    getOptionsForStatment(sqlStatement) {
        return null;
    }

    setDBConnection(onConnectionFetched) {
        if (this.dialect.useConnectionPool) {
            if (this.databaseConnection) // active connection exists no need to connect again
                onConnectionFetched(null);
            else {
                this.connect(function (err) {
                    onConnectionFetched(err);
                });
            }
        }
        else
            onConnectionFetched(null);
    }

    onSQLExecuted(err, result, onExecuted) {
        this.closeConnectionIfRequired(function (connErr) {
            if (err)
                onExecuted(err, result);
            else
                onExecuted(connErr, result);
        });
    }

    closeConnectionIfRequired(onConnectionClosed) {
        if (this.dialect.useConnectionPool && !this.isTransactionInProgress && !this.queryInProgress) {
            var self = this;
            this.disconnect(function (connErr) {
                self.databaseConnection = null;
                onConnectionClosed(connErr);
            });
        }
        else
            onConnectionClosed(null);
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

    basicBeginTransaction(onTransactionBegan) {
        throw new ApatiteSubclassResponsibilityError();
    }

    basicCommitTransaction(onTransactionCommitted) {
        throw new ApatiteSubclassResponsibilityError();
    }

    basicRollbackTransaction(onTransactionRollbacked) {
        throw new ApatiteSubclassResponsibilityError();
    }

    beginTransaction(onTransactionBegan) {
        var self = this;
        this.basicBeginTransaction(function (err) {
            if (err)
                onTransactionBegan(err);
            else {
                self.isTransactionInProgress = true;
                onTransactionBegan(null);
            }
        });
    }

    commitTransaction(onTransactionCommitted) {
        var self = this;
        this.basicCommitTransaction(function (err) {
            self.isTransactionInProgress = false;
            self.closeConnectionIfRequired(function (connErr) {
                if (err)
                    onTransactionCommitted(err);
                else
                    onTransactionCommitted(connErr);
            });
        });
    }

    rollbackTransaction(onTransactionRollbacked) {
        var self = this;
        this.basicRollbackTransaction(function (err) {
            self.isTransactionInProgress = false;
            self.closeConnectionIfRequired(function (connErr) {
                if (err)
                    onTransactionRollbacked(err);
                else
                    onTransactionRollbacked(connErr);
            });
        });
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
        this.queryInProgress = true; // prevent the connection to be closed, becuase getAllResults call below needs it
        this.executeSQLStatement(sqlBuilder.buildSQLStatement(), function (err, result) {
            if (err) {
                self.queryInProgress = false;
                self.closeConnectionIfRequired(function (connErr) {
                    onExecuted(err, null);
                });
                return;
            }
            var cursor = new ApatiteCursor(query, self.dialect.getApatiteResultSet(result));
            cursor.getAllResults(function (cursorErr, results) {
                self.queryInProgress = false;
                self.closeConnectionIfRequired(function (connErr) {
                    if (cursorErr)
                        onExecuted(cursorErr, results);
                    else
                        onExecuted(connErr, results);
                });
            });

        });
    }
}


module.exports = ApatiteConnection;