'use strict';

class ApatiteSQLStatement {
    constructor(tableName, sqlString, bindings) {
        this.tableName = tableName;
        this.sqlString = sqlString;
        this.bindings = bindings;
        this.sqlResult = null;
        this.object = null;
    }

    isSelect() {
        return false;
    }

    setSQLResult(sqlResult) {
        this.sqlResult = sqlResult;
    }
}

module.exports = ApatiteSQLStatement;