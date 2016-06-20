'use strict';

var ApatiteAttributeExpression = require('../query-expression/apatite-attribute-expression.js');
var ApatiteOperatorExpression = require('../query-expression/apatite-operator-expression.js');
var ApatiteValueExpression = require('../query-expression/apatite-value-expression.js');
var ApatiteOrderByExpression = require('../query-expression/apatite-order-by-expression.js');
var ApatiteQueryAbstract = require('./apatite-query-abstract.js');
var ApatiteError = require('../error/apatite-error.js');
var ApatiteFunctionExpression = require('../query-expression/apatite-function-expression.js');

class ApatiteQuery extends ApatiteQueryAbstract
{
    constructor(apatite, modelOrModelName) {
        super(apatite);
        if (!modelOrModelName)
            throw new ApatiteError('A valid model is required for query.');

        this.setModelName(typeof modelOrModelName === 'string' ? modelOrModelName : modelOrModelName.name);
        this.attrColumnMapping = {};
    }

    buildColumnNamesToFetch(sqlBuilder) {
        var descriptor = this.getModelDescriptor();
        var columnNames = [];
        var attrExpressions;
        if (this.attributesToFetch.length)
            attrExpressions = this.attributesToFetch;
        else {
            attrExpressions = []
            descriptor.getMappings().forEach(function (eachMapping) {
                eachMapping.buildAttrExpressions(descriptor).forEach(function (eachAttrExpr) {
                    attrExpressions.push(eachAttrExpr);
                });
            });
        }
        var self = this;
        var dialect = this.apatite.dialect;
        attrExpressions.forEach(function (eachAttrExpr) {
            var columnName = eachAttrExpr.buildExpressionForSQL(sqlBuilder, descriptor);
            var aliasName = eachAttrExpr.getAliasNameForSQLExpr(columnName);
            self.attrColumnMapping[eachAttrExpr.expressionValue] = aliasName;
            columnNames.push(`${columnName} AS "${aliasName}"`);
        });

        return columnNames;
    }

    orderBy(attributeName) {
        var attrExpr = new ApatiteAttributeExpression(attributeName, this);
        var orderByExpr = new ApatiteOrderByExpression(attrExpr, this);
        this.orderByExpressions.push(orderByExpr);
    }

    fetchAttr(attributeName) {
        return this.fetchAttribute(attributeName);
    }

    fetchAttrs(attributeNames) {
        return this.fetchAttributes(attributeNames);
    }

    fetchAttribute(attributeName) {
        return this.addToAttrsToFetch(new ApatiteAttributeExpression(attributeName));
    }

    fetchAttributes(attributeNames) {
        var self = this;
        attributeNames.forEach(function (eachAttrName) {
            self.fetchAttribute(eachAttrName);
        });
        return this;
    }

    addToAttrsToFetch(attrExpr) {
        this.attributesToFetch.push(attrExpr);
        return this;
    }

    fetchCountAs(aliasName) {
        return this.addToAttrsToFetch(new ApatiteFunctionExpression(null, this, 'COUNT(*)', aliasName));
    }

    fetchSumAs(attributeName, aliasName) {
        return this.fetchFunctionAs('SUM', attributeName, aliasName);
    }

    fetchMaxAs(attributeName, aliasName) {
        return this.fetchFunctionAs('MAX', attributeName, aliasName);
    }

    fetchMinAs(attributeName, aliasName) {
        return this.fetchFunctionAs('MIN', attributeName, aliasName);
    }

    fetchAvgAs(attributeName, aliasName) {
        return this.fetchFunctionAs('AVG', attributeName, aliasName);
    }

    fetchDistinctAs(attributeName, aliasName) {
        return this.fetchFunctionAs('DISTINCT', attributeName, aliasName);
    }

    fetchFunctionAs(functionName, attributeName, aliasName) {
        return this.addToAttrsToFetch(new ApatiteFunctionExpression(attributeName, this, functionName, aliasName));
    }
}

module.exports = ApatiteQuery;