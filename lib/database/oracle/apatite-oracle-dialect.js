'use strict';

var ApatiteDialect = require('../apatite-dialect.js');
var ApatiteOracleConnection = require('./apatite-oracle-connection.js');
var ApatiteOracleResultSet = require('./apatite-oracle-result-set.js');

const bindVariableId = 'V';

class ApatiteOracleDialect extends ApatiteDialect {
    constructor(connectionOptions) {
        super(connectionOptions);
    }

    static getModuleName() {
        return ApatiteOracleConnection.getModuleName();
    }

    buildBindVariable(sqlBuilder) {
        return ':' + bindVariableId + sqlBuilder.getNextBindVariableId();
    }

    buildExpressionForColumnInSelectStmt(sqlExpr) {
        return `${sqlExpr} AS "${sqlExpr}"`;
    }

    buildBindingsForReturningID(bindings, columnName) {
        var returnBindings = {};
        for (var i = 0; i < bindings.length; i++) {
            returnBindings[bindVariableId + (i + 1)] = bindings[i];
        }
        returnBindings[columnName] = { type: ApatiteOracleConnection.getOracleDb().NUMBER, dir: ApatiteOracleConnection.getOracleDb().BIND_OUT };
        return returnBindings;
    }

    buildReturningSerialIDStr(columnName) {
        return ` RETURNING ${columnName} INTO :${columnName}`;
    }

    newConnection() {
        return new ApatiteOracleConnection(this);
    }

    getApatiteResultSet(dbCursor) {
        return new ApatiteOracleResultSet(dbCursor);
    }
}


module.exports = ApatiteOracleDialect;