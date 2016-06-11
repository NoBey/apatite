'use strict';

var ApatiteDMLSQLBuilder = require('./apatite-dml-sql-builder.js');
var ApatiteDeleteSQLStatement = require('../database-statement/apatite-delete-sql-statement.js');

class ApatiteDeleteSQLBuilder extends ApatiteDMLSQLBuilder {
    constructor(session, object) {
        super(session, object);
    }

    buildSQLStatement() {
        var descriptor = this.session.apatite.getModelDescriptor(this.object.constructor.name);
        var attrExprs = this.buildAttrExprsForSQL(descriptor.getPrimaryKeyMappings());
        var sqlExprs = [];
        var bindings = [];
        var self = this;
        attrExprs.forEach(function (eachAttrExpr) {
            sqlExprs.push(eachAttrExpr.mappingColumn.columnName + ' = ' + self.buildBindVariable());
            bindings.push(eachAttrExpr.valueExpression.expressionValue);
        });

        var tableName = descriptor.table.tableName;

        var sqlStr = 'DELETE FROM ' + tableName + ' WHERE ' + sqlExprs.join(' AND ');
        return new ApatiteDeleteSQLStatement(tableName, sqlStr, bindings);
    }
}

module.exports = ApatiteDeleteSQLBuilder;