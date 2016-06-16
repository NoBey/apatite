'use strict';

var ApatiteSubclassResponsibilityError = require('../error/apatite-subclass-responsibility-error.js');

class ApatiteExpression
{
    constructor(expressionValue, query) {
        this.expressionValue = expressionValue;
        this.query = query;
    }

    buildExpressionForSQL(sqlBuilder, descriptor) {
        return this.expressionValue;
    }

    getBindings(descriptor) {
        return [];
    }

    isValueExpression() {
        return false;
    }

    isAttributeExpression() {
        return false;
    }

    matchesRow(previousExprResult, objectBuilder) {
        throw new ApatiteSubclassResponsibilityError();
    }

    matchesObject(previousExprResult, object) {
        throw new ApatiteSubclassResponsibilityError();
    }

    getAttributeNames() {
        throw new ApatiteSubclassResponsibilityError();
    }

    getAttrNamesWithValues() {
        throw new ApatiteSubclassResponsibilityError();
    }

    setSubQuerySession(session) {
    }
}


module.exports = ApatiteExpression;