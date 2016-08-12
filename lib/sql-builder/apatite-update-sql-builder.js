'use strict';

var ApatiteDMLSQLBuilder = require('./apatite-dml-sql-builder.js');
var ApatiteUpdateSQLStatement = require('../database-statement/apatite-update-sql-statement.js');

class ApatiteUpdateSQLBuilder extends ApatiteDMLSQLBuilder {
    constructor(session, object, changeSet) {
        super(session, object);
        this.changeSet = changeSet;
    }

    buildSQLStatement() {
        var descriptor = this.session.apatite.getModelDescriptor(this.object.constructor.name);
        var sqlExprs = [];
        var bindings = [];

        var mappings = [];
        this.changeSet.getChangedAttrNames().forEach(function (eachAttrName) {
            mappings.push(descriptor.mappings[eachAttrName]);
        });

        var attrExprs = this.buildAttrExprsForSQL(mappings);
        var self = this;
        attrExprs.forEach(function (eachAttrExpr) {
            var columnName = eachAttrExpr.mappingColumn.columnName;
            var bindingValue = eachAttrExpr.valueExpression.buildValueSQL(descriptor)[0];
            var bindVar = self.buildBindVariable();
            if (eachAttrExpr.mappingColumn.hasRelativeUpdate) {
                var oldValue = self.changeSet.changedAttrs[eachAttrExpr.expressionValue].oldValue;
                bindingValue = bindingValue - oldValue;
                sqlExprs.push(columnName + ' = ' + columnName + ' + ' + bindVar);
            }
            else
                sqlExprs.push(columnName + ' = ' + bindVar);
            bindings.push(bindingValue);
        });

        var tableName = descriptor.table.tableName;
        var sqlStr = 'UPDATE ' + tableName + ' SET ';
        sqlStr += sqlExprs.join(', ');
        sqlExprs = [];
        attrExprs = this.buildAttrExprsForSQL(descriptor.getPrimaryKeyMappings());
        attrExprs.forEach(function (eachAttrExpr) {
            sqlExprs.push(eachAttrExpr.mappingColumn.columnName + ' = ' + self.buildBindVariable());
            bindings.push(eachAttrExpr.valueExpression.buildValueSQL(descriptor)[0]);
        });

        sqlStr = sqlStr + ' WHERE ' + sqlExprs.join(' AND ');

        return new ApatiteUpdateSQLStatement(tableName, sqlStr, bindings);
    }
}

module.exports = ApatiteUpdateSQLBuilder;