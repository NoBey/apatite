'use strict';

var ApatiteExpression = require('./apatite-expression.js');

class ApatiteValueExpression extends ApatiteExpression {
    constructor(expressionValue, owningAttrExpression, query) {
        super(expressionValue, query);
        this.owningAttrExpression = owningAttrExpression;
    }

    buildExpressionForSQL(sqlBuilder, descriptor) {
        return sqlBuilder.buildBindVariable();
    }

    buildValueSQL(descriptor) {
        return descriptor.findLeafColumnForAttr(this.owningAttrExpression.expressionValue).convertValueForDB(this.expressionValue);
    }

    isValueExpression() {
        return true;
    }
}

module.exports = ApatiteValueExpression;