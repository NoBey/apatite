
'use strict';

var ApatiteAttributeExpression = require('../query-expression/apatite-attribute-expression.js');
var ApatiteOperatorExpression = require('../query-expression/apatite-operator-expression.js');
var ApatiteLogicalOperatorExpression = require('../query-expression/apatite-logical-operator-expression.js');
var ApatiteEncloseExpression = require('../query-expression/apatite-enclose-expression.js');
var ApatiteValueExpression = require('../query-expression/apatite-value-expression.js');

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
            return true;

        if (this.hasOnlyPKExpressions !== null)
            return this.hasOnlyPKExpressions;

        this.setHasOnlyPKExpressions();    

        return this.hasOnlyPKExpressions;
    }

    setHasOnlyPKExpressions() {
        this.hasOnlyPKExpressions = this.whereExpressions.length === 0 ? true : this.basicHasOnlyPrimaryKeyExpressions();
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

    getAttributeNames() {
        var attrNames = [];
        for (var i = 0; i < this.whereExpressions.length; i++) {
            attrNames = attrNames.concat(this.whereExpressions[i].getAttributeNames());
        }

        return attrNames;
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
        var matches;
        for (var i = 0; i < this.whereExpressions.length; i++) {
            if (!this.whereExpressions[i].matchesRow(matches, objectBuilder)) {
                matches = false;
                break;
            }

            matches = true;
        }

        return matches;
    }

    matchesObject(object) {
        var matches;
        for (var i = 0; i < this.whereExpressions.length; i++) {
            if (!this.whereExpressions[i].matchesObject(matches, object)) {
                matches = false;
                break;
            }

            matches = true;
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

    validate() {
        if (!this.getModelDescriptor())
            throw new ApatiteError('Descriptor for model: ' + this.modelName + ' not found.');
    }
}

module.exports = ApatiteQueryAbstract;