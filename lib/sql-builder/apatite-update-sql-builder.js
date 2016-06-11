'use strict';

var ApatiteDMLSQLBuilder = require('./apatite-dml-sql-builder.js');
var ApatiteUpdateSQLStatement = require('../database-statement/apatite-update-sql-statement.js');

class ApatiteUpdateSQLBuilder extends ApatiteDMLSQLBuilder {
    constructor(session, object, updatedAttrNames) {
        super(session, object);
        this.updatedAttrNames = updatedAttrNames;
    }

    buildSQLStatement() {
        var descriptor = this.session.apatite.getModelDescriptor(this.object.constructor.name);
        var sqlExprs = [];
        var bindings = [];

        var mappings = [];
        this.updatedAttrNames.forEach(function (eachAttrName) {
            mappings.push(descriptor.mappings[eachAttrName]);
        });

        var attrExprs = this.buildAttrExprsForSQL(mappings);
        var self = this;
        attrExprs.forEach(function (eachAttrExpr) {
            sqlExprs.push(eachAttrExpr.mappingColumn.columnName + ' = ' + self.buildBindVariable());
            bindings.push(eachAttrExpr.valueExpression.buildValueSQL(descriptor));
        });

        var tableName = descriptor.table.tableName;
        var sqlStr = 'UPDATE ' + tableName + ' SET ';
        sqlStr += sqlExprs.join(', ');
        sqlExprs = [];
        attrExprs = this.buildAttrExprsForSQL(descriptor.getPrimaryKeyMappings());
        attrExprs.forEach(function (eachAttrExpr) {
            sqlExprs.push(eachAttrExpr.mappingColumn.columnName + ' = ' + self.buildBindVariable());
            bindings.push(eachAttrExpr.valueExpression.buildValueSQL(descriptor));
        });

        sqlStr = sqlStr + ' WHERE ' + sqlExprs.join(' AND ');

        return new ApatiteUpdateSQLStatement(tableName, sqlStr, bindings);
    }
}

module.exports = ApatiteUpdateSQLBuilder;