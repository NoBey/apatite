'use strict';

var ApatiteSQLBuilder = require('./apatite-sql-builder.js');
var ApatiteSelectSQLStatement = require('../database-statement/apatite-select-sql-statement.js');

class ApatiteSelectSQLBuilder extends ApatiteSQLBuilder {
    constructor(query) {
        super(query.session);
        this.query = query;
        this.tableAliasCount = 0;
        this.joinAttrAliasNames = {};
        this.tableAliasNames = {};
        this.mainTableIdentifier = '.';
    }

    getOrCreateTableAliasName(attributeName) {
        var aliasIdentifier = this.mainTableIdentifier;
        if (attributeName) {
            aliasIdentifier = attributeName;
        }

        if (this.joinAttrAliasNames[aliasIdentifier])
            return this.joinAttrAliasNames[aliasIdentifier];

        this.tableAliasCount += 1;
        var aliasName = 'T' + this.tableAliasCount;
        this.joinAttrAliasNames[aliasIdentifier] = aliasName;
        return aliasName;
    }

    getSQLStatementClass() {
        return ApatiteSelectSQLStatement;
    }

    buildSQLStatement() {
        this.query.addTypeFilterQueryExpressions();

        //Create alias for the main table always so the main table is T1
        this.getOrCreateTableAliasName();

        var columnsStr = this.query.buildColumnNamesToFetch(this).join(', ');
        var whereStr = this.buildWhereSQLString();
        var orderByStr = this.buildOrderBySQLString();

        //The following two calls must be after the above is executed becuase table aliases are built in the calls above
        var joinStr = this.buildJoinsSQLString();
        var tableNamesStr = this.buildTableNamesSQLString();

        var sqlStr = 'SELECT ' + columnsStr + ' FROM ' + tableNamesStr + joinStr;

        if (whereStr.length)
            if (joinStr.length)
                sqlStr += ' AND';
            else
                sqlStr += ' WHERE';

        sqlStr += whereStr + orderByStr;

        return new ApatiteSelectSQLStatement(null, sqlStr, this.query.getBindings());
    }

    buildJoinsSQLString() {

        var sqlStr = '';
        if (this.tableAliasCount <= 1)
            return sqlStr;

        sqlStr += ' WHERE ';
        var initialStrLength = sqlStr.length;

        var definedAliases = {};
        for (var eachJoinAttrName in this.joinAttrAliasNames) {
            if (eachJoinAttrName !== this.mainTableIdentifier) {
                definedAliases[eachJoinAttrName] = this.joinAttrAliasNames[eachJoinAttrName];
            }
        }
        var self = this;
        var fromDescriptor, fromTableAliasName, mapping, fromColumns, toColumns, joinArr, toTableAliasName, joinAttrName;
        var definedJoins = {};
        for (var eachJoinAttrName in definedAliases) {
            fromDescriptor = self.query.getModelDescriptor();
            fromTableAliasName = self.getOrCreateTableAliasName();
            joinAttrName = '';
            joinArr = eachJoinAttrName.split('.');
            joinArr.forEach(function (eachAttrName) {
                mapping = fromDescriptor.getMappingForAttribute(eachAttrName);
                fromColumns = mapping.columns;
                toColumns = mapping.toColumns;
                joinAttrName += (joinAttrName.length ? '.' : '') + eachAttrName;
                toTableAliasName = self.getOrCreateTableAliasName(joinAttrName);

                if (!definedJoins[joinAttrName]) {
                    if (sqlStr.length !== initialStrLength)
                        sqlStr += ' AND ';

                    for (var i = 0; i < fromColumns.length; i++) {
                        sqlStr += fromTableAliasName + '.' + fromColumns[i].columnName + ' = ' + toTableAliasName + '.' + toColumns[i].columnName;
                    }
                    definedJoins[joinAttrName] = true;
                }

                fromDescriptor = fromDescriptor.getModelDescriptor(mapping);
                if (!self.tableAliasNames[joinAttrName])
                    self.tableAliasNames[joinAttrName] = [fromDescriptor.table.tableName, toTableAliasName];

                fromTableAliasName = toTableAliasName;
            });
        }

        return sqlStr;
    }

    buildTableNamesSQLString() {
        var tableAliasName = this.getOrCreateTableAliasName();
        var descriptor = this.query.getModelDescriptor();
        var definedTableAliases = [];
        definedTableAliases.push(descriptor.table.tableName + ' ' + tableAliasName);
        for (var eachJoinAttrName in this.tableAliasNames) {
            var aliasInfo = this.tableAliasNames[eachJoinAttrName]
            definedTableAliases.push(aliasInfo[0] + ' ' + aliasInfo[1]);
        }

        return definedTableAliases.join(', ');
    }

    buildWhereSQLString() {
        var sqlStr = '';

        if (!this.query.whereExpressions.length)
            return sqlStr;

        var descriptor = this.query.getModelDescriptor();

        var self = this;
        this.query.whereExpressions.forEach(function (eachWhereExpr) {
            var sqlExpr = eachWhereExpr.buildExpressionForSQL(self, descriptor);
            sqlStr += ((sqlExpr.length && (sqlExpr[0] === ' ')) ? sqlExpr : ' ' + sqlExpr);
        });

        return sqlStr;
    }

    buildOrderBySQLString() {
        var sqlStr = '';

        if (!this.query.orderByExpressions.length)
            return sqlStr;

        var descriptor = this.query.getModelDescriptor();

        var self = this;
        var sqlExprs = [];
        this.query.orderByExpressions.forEach(function (eachOrderByExpr) {
            var sqlExpr = eachOrderByExpr.buildExpressionForSQL(self, descriptor);
            sqlExprs.push(sqlExpr);
            
        });

        return ' ORDER BY ' + sqlExprs.join(', ');
    }
}

module.exports = ApatiteSelectSQLBuilder;