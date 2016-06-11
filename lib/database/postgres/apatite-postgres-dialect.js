'use strict';

var ApatiteDialect = require('../apatite-dialect.js');
var ApatitePostgresConnection = require('./apatite-postgres-connection.js');
var ApatitePostgresResultSet = require('./apatite-postgres-result-set.js');

class ApatitePostgresDialect extends ApatiteDialect {
    constructor(connectionOptions) {
        super(connectionOptions);
    }

    static getModuleName() {
        return ApatitePostgresConnection.getModuleName();
    }

    buildBindVariable(sqlBuilder) {
        return '$' + sqlBuilder.getNextBindVariableId();
    }

    buildExpressionForColumnInSelectStmt(sqlExpr) {
        return `${sqlExpr} AS "${sqlExpr}"`;
    }

    newConnection() {
        return new ApatitePostgresConnection(this);
    }

    getApatiteResultSet(dbCursor) {
        return new ApatitePostgresResultSet(dbCursor);
    }
}


module.exports = ApatitePostgresDialect;