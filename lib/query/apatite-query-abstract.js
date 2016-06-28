
'use strict';

var ApatiteAttributeExpression = require('../query-expression/apatite-attribute-expression.js');
var ApatiteOperatorExpression = require('../query-expression/apatite-operator-expression.js');
var ApatiteLogicalOperatorExpression = require('../query-expression/apatite-logical-operator-expression.js');
var ApatiteEncloseExpression = require('../query-expression/apatite-enclose-expression.js');
var ApatiteValueExpression = require('../query-expression/apatite-value-expression.js');
var ApatiteOrderByExpression = require('../query-expression/apatite-order-by-expression.js');

var ApatiteError = require('../error/apatite-error.js');

class ApatiteQueryAbstract {
    constructor(apatite) {
        this.apatite = apatite;
        this.modelName = null;
        this.session = null;
        this.whereExpressions = [];
        this.attributesToFetch = [];
        this.orderByExpressions = [];
        this.hasOnlyPKExpressions = null;
        this.isSubQuery = false;
        this.isInternalQuery = false;
        this.defineConditionalProperties();
    }

    defineConditionalProperties() {
        var self = this;
        Object.defineProperty(this, 'or', {
            get: function () {
                return self.addOrExpression();
            }
        });
        Object.defineProperty(this, 'and', {
            get: function () {
                return self.addAndExpression();
            }
        });
        Object.defineProperty(this, 'enclose', {
            get: function () {
                return self.addEncloseExpression();
            }
        });
    }

    beInternalQuery() {
        this.isInternalQuery = true;
    }

    hasOnlyPrimaryKeyExpressions() {
        if (this.isInternalQuery)
            return false;

        if (this.hasOnlyPKExpressions !== null)
            return this.hasOnlyPKExpressions;

        this.setHasOnlyPKExpressions();    

        return this.hasOnlyPKExpressions;
    }

    orderBy(attributeName) {
        var attrExpr = new ApatiteAttributeExpression(attributeName, this);
        var orderByExpr = new ApatiteOrderByExpression(attrExpr, this);
        this.orderByExpressions.push(orderByExpr);
        return orderByExpr;
    }

    setHasOnlyPKExpressions() {
        this.hasOnlyPKExpressions = this.whereExpressions.length === 0 ? false : this.basicHasOnlyPrimaryKeyExpressions();
    }

    basicHasOnlyPrimaryKeyExpressions() {
        var descriptor = this.getModelDescriptor();
        var allAttrNames = this.getAttributeNames();
        var pkAttrNames = descriptor.getPrimaryKeyAttributeNames();

        if (pkAttrNames.length !== allAttrNames.length)
            return false;

        for (var i = 0; i < pkAttrNames.length; i++) {
            var idx = allAttrNames.indexOf(pkAttrNames[i]);
            if (idx === -1)
                return false;

            allAttrNames.splice(idx, 1);
        }

        return allAttrNames.length === 0;
    }

    getAttributeNames() { //cannot be used for anything else other than checking if query has only PK expressions
        var attrNames = [];
        for (var i = 0; i < this.whereExpressions.length; i++) {
            attrNames = attrNames.concat(this.whereExpressions[i].getAttributeNames());
        }

        return attrNames;
    }

    setPropOnObjectForCacheKey(object) {
        for (var i = 0; i < this.whereExpressions.length; i++) {
            this.whereExpressions[i].setPropOnObjectForCacheKey(object)
        }
    }

    expandOneToOneExpressions() {
        var exprsToExpand = [];
        var exprsToReplace = [];
        this.whereExpressions.forEach(function (eachExpr) {
            if (eachExpr.subQuery && eachExpr.subQuery.isSubQuery)
                eachExpr.subQuery.expandOneToOneExpressions();
            else if (eachExpr.isAttributeExpression()) {
                var expandedExprs = eachExpr.getExpandedExpressions();
                if (expandedExprs) {
                    exprsToExpand.push(eachExpr);
                    exprsToReplace.push(expandedExprs);
                }
            }
        });
        for (var i = 0; i < exprsToExpand.length; i++) {
            var idxToReplace = this.whereExpressions.indexOf(exprsToExpand[i]);
            var subQuery = this.enclose; // enclose expression would be added at the end, remove it in next line
            var exprToInsert = this.whereExpressions.pop();
            var lastQuery = subQuery;
            exprsToReplace[i].forEach(function (eachAttrExpr) {
                var attrExpr = subQuery.attribute(eachAttrExpr.expressionValue);
                attrExpr.operatorExpression = eachAttrExpr.operatorExpression;
                attrExpr.valueExpression = eachAttrExpr.valueExpression;
                lastQuery = subQuery;
                subQuery = subQuery.and;
            });
            if (lastQuery.whereExpressions.length > 1)
                lastQuery.removeLastWhereExpression(); // remove the trailing and

            this.whereExpressions.splice(idxToReplace, 1, exprToInsert);
        }

    }

    addOrExpression() {
        return this.addConditionalOperatorExpression('OR');
    }

    addAndExpression() {
        return this.addConditionalOperatorExpression('AND');
    }

    addConditionalOperatorExpression(operator) {
        return this.addOperatorExpression(ApatiteLogicalOperatorExpression, operator);
    }

    addOperatorExpression(expressionClass, operator) {
        var subQuery = this.apatite.newQuery(this.modelName);
        subQuery.isSubQuery = true;
        subQuery.setSession(this.session);
        this.whereExpressions.push(new expressionClass(operator, subQuery));
        return subQuery;
    }

    addEncloseExpression() {
        return this.addOperatorExpression(ApatiteEncloseExpression, '');
    }

    removeLastWhereExpression() {
        this.whereExpressions.pop();

    }

    matchesRow(objectBuilder) {
        var matches = true;
        for (var i = 0; i < this.whereExpressions.length; i++) {
            matches = this.whereExpressions[i].matchesRow(matches, objectBuilder);
        }

        return matches;
    }

    matchesObject(object) {
        var matches = true;
        if (!this.whereExpressions.length)
            return matches;

        for (var i = 0; i < this.whereExpressions.length; i++) {
            matches = this.whereExpressions[i].matchesObject(matches, object);
        }

        return matches;
    }

    fetchesObjects() {
        return this.attributesToFetch.length === 0;
    }

    buildResultForRow(tableRow) {
        if (this.fetchesObjects())
            return this.session.buildObjectForRow(tableRow, this);
        else
            return this.session.buildAttrListForRow(tableRow, this);
    }

    getBindings() {
        var bindings = [];
        var descriptor = this.getModelDescriptor();
        this.whereExpressions.forEach(function (eachExpr) {
            bindings = bindings.concat(eachExpr.getBindings(descriptor));
        });
        return bindings;
    }

    setModelName(modelName) {
        this.modelName = modelName;
    }

    setSession(session) {
        this.session = session;
        this.whereExpressions.forEach(function (eachExpr) {
            eachExpr.setSubQuerySession(session);
        });
    }

    addTypeFilterQueryExpressions() {
        var descriptor = this.getModelDescriptor();
        if (!descriptor.typeFilterQuery)
            return;

        this.setHasOnlyPKExpressions();

        var subQuery = this.enclose;
        descriptor.typeFilterQuery.whereExpressions.forEach(function (eachExpr) {
            eachExpr.query = subQuery;
            subQuery.whereExpressions.push(eachExpr);
        });
    }

    getModelDescriptor() {
        return this.session.apatite.getModelDescriptor(this.modelName);
    }

    attr(attributeName) {
        return this.attribute(attributeName);
    }

    attribute(attributeName) {
        var attrExpr = new ApatiteAttributeExpression(attributeName, this);
        this.whereExpressions.push(attrExpr);
        return attrExpr;
    }

    execute(onExecuted) {
        if (!this.session)
            return onExecuted(new ApatiteError('There is no session associated with the query. Use execute on session.'));

        this.session.execute(this, onExecuted);
    }

    validate() {
        if (!this.getModelDescriptor())
            throw new ApatiteError('Descriptor for model: ' + this.modelName + ' not found.');
    }
}

module.exports = ApatiteQueryAbstract;