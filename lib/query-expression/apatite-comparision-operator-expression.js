'use strict';

var ApatiteOperatorExpression = require('./apatite-operator-expression.js');

class ApatiteComparisionOperatorExpression extends ApatiteOperatorExpression {
    constructor(expressionValue) {
        super(expressionValue);
    }

    operateOn(leftValue, rightValue) {
        var result;
        switch (this.expressionValue) {
            case '=':
                result = leftValue === rightValue;
                break;
            default:
                throw new Error('Not expected to reach here.');
        }
        return result;
    }
}

module.exports = ApatiteComparisionOperatorExpression;