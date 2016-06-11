'use strict';

var ApatiteSQLStatement = require('./apatite-sql-statement.js');

class ApatiteInsertSQLStatement extends ApatiteSQLStatement {
    constructor(tableName, sqlString, bindings, serialPKAttrExpr) {
        super(tableName, sqlString, bindings);
        this.serialPKAttrExpr = serialPKAttrExpr;
    }

    setSQLResult(sqlResult) {
        super.setSQLResult(sqlResult);
        if (sqlResult && this.serialPKAttrExpr) {
            var columnName = this.serialPKAttrExpr.mappingColumn.columnName;
            var attrName = this.serialPKAttrExpr.expressionValue;
            if (sqlResult.length)
                this.object[attrName] = sqlResult[0][columnName];
            else if (sqlResult[columnName])
                this.object[attrName] = sqlResult[columnName][0];
        }
    }
}

module.exports = ApatiteInsertSQLStatement;