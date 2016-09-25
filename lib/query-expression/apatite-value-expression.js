'use strict';

var ApatiteExpression = require('./apatite-expression.js');
var ApatiteAttributeJoinExpression = require('./apatite-attribute-join-expression.js');

class ApatiteValueExpression extends ApatiteExpression {
    constructor(expressionValue, owningAttrExpression, query) {
        super(expressionValue, query);
        this.owningAttrExpression = owningAttrExpression;
    }

    buildExpressionForSQL(sqlBuilder, descriptor) {
        if (this.expressionValue instanceof Array) {
            var exprForSQL = '(';
            var bindVars = [];
            this.expressionValue.forEach(function (eachVal) {
                bindVars.push(sqlBuilder.buildBindVariable());
            });
            exprForSQL += bindVars.join(',');
            exprForSQL += ')';
            return exprForSQL;
        } else if (this.expressionValue instanceof ApatiteAttributeJoinExpression) {
            return this.expressionValue.buildExpressionForSQL(sqlBuilder.parentSQLBuilder);
        } else {
            return sqlBuilder.buildBindVariable();
        }
    }

    buildValueSQL(descriptor) {
        var column = descriptor.findLeafColumnForAttr(this.owningAttrExpression.expressionValue);
        if (this.expressionValue instanceof Array) {
            var valuesForSQL = [];
            this.expressionValue.forEach(function (eachVal) {
                valuesForSQL.push(column.convertValueForDB(eachVal));
            });
            return valuesForSQL;
        } else if (this.expressionValue instanceof ApatiteAttributeJoinExpression) {
            return [];
        } else {
            return [column.convertValueForDB(this.expressionValue)];
        }
    }

}

module.exports = ApatiteValueExpression;