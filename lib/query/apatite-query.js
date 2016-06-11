'use strict';

var ApatiteAttributeExpression = require('../query-expression/apatite-attribute-expression.js');
var ApatiteOperatorExpression = require('../query-expression/apatite-operator-expression.js');
var ApatiteValueExpression = require('../query-expression/apatite-value-expression.js');
var ApatiteOrderByExpression = require('../query-expression/apatite-order-by-expression.js');
var ApatiteQueryAbstract = require('./apatite-query-abstract.js');
var ApatiteError = require('../error/apatite-error.js');

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
            var sqlExpr = eachAttrExpr.buildExpressionForSQL(sqlBuilder, descriptor);
            self.attrColumnMapping[eachAttrExpr.expressionValue] = sqlExpr;
            columnNames.push(dialect.buildExpressionForColumnInSelectStmt(sqlExpr));
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
        this.attributesToFetch.push(new ApatiteAttributeExpression(attributeName));
        return this;
    }

    fetchAttributes(attributeNames) {
        var self = this;
        attributeNames.forEach(function (eachAttrName) {
            self.fetchAttribute(eachAttrName);
        });
        return this;
    }
}

module.exports = ApatiteQuery;