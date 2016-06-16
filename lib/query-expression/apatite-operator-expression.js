'use strict';

var ApatiteExpression = require('./apatite-expression.js');

class ApatiteOperatorExpression extends ApatiteExpression {
    constructor(expressionValue, query) {
        super(expressionValue);
        this.subQuery = query;
    }

    getBindings(descriptor) {
        return this.subQuery.getBindings();
    }

    getAttributeNames() {
        return this.subQuery.getAttributeNames();
    }

    setPropOnObjectForCacheKey(object) {
        this.subQuery.setPropOnObjectForCacheKey(object)
    }

    setSubQuerySession(session) {
        if (this.subQuery)
            this.subQuery.setSession(session);
    }
}

module.exports = ApatiteOperatorExpression;