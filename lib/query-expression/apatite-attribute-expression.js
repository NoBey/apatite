'use strict';

var ApatiteExpression = require('./apatite-expression.js');
var ApatiteError = require('../error/apatite-error.js');
var ApatiteOperatorExpression = require('./apatite-operator-expression.js');
var ApatiteComparisionOperatorExpression = require('./apatite-comparision-operator-expression.js');
var ApatiteValueExpression = require('./apatite-value-expression.js');

class ApatiteAttributeExpression extends ApatiteExpression {
    constructor(expressionValue, query) {
        super(expressionValue, query);
        this.operatorExpression = null;
        this.valueExpression = null;
        this.mappingColumn = null;
    }

    setMappingColumn(mappingColumn) {
        this.mappingColumn = mappingColumn;
    }

    getAttributeNames() {
        return [this.expressionValue];
    }

    matchesRow(previousExprResult, objectBuilder) {
        var attrColumnMapping = objectBuilder.query.attrColumnMapping;
        var columnName = attrColumnMapping[this.expressionValue];
        var rowValue = objectBuilder.tableRow[columnName];

        return this.operatorExpression.operateOn(rowValue, this.valueExpression.expressionValue);
    }

    matchesObject(previousExprResult, object) {
        var objValue = object;
        var splitArr = this.expressionValue.split('.');
        for (var i = 0; i < splitArr.length; i++) {
            if (objValue === null)
                break;

            objValue = objValue[splitArr[i]];
        }

        return this.operatorExpression.operateOn(objValue, this.valueExpression.expressionValue);
    }

    isAttributeExpression() {
        return true;
    }

    eq(attributeValue) {
        return this.equals(attributeValue);
    }

    getBindings(descriptor) {
        return [this.valueExpression.buildValueSQL(descriptor)];
    }

    equals(attributeValue) {
        this.operatorExpression = new ApatiteComparisionOperatorExpression('=');
        this.valueExpression = new ApatiteValueExpression(attributeValue, this, this.query);
        return this.query;
    }

    buildExpressionForSQL(sqlBuilder, descriptor) {
        var mapping = descriptor.getMappingForAttribute(this.expressionValue);
        var attrName = this.expressionValue;
        var columnName = null;
        if (mapping.isSimpleMapping()) {
            columnName = mapping.column.columnName;
            var splitArr = attrName.split('.');
            var leafAttrName = splitArr.pop();
            attrName = splitArr.join('.');
            if (attrName) {
                var oneToOneMapping = descriptor.getMappingForAttribute(attrName);
                var oneToOneDescriptor = descriptor.getModelDescriptor(oneToOneMapping);
                if (oneToOneDescriptor.getPrimaryKeyAttributeNames().indexOf(leafAttrName) !== -1) {
                    mapping = oneToOneDescriptor.getMappingForAttribute(leafAttrName);
                    columnName = oneToOneMapping.columns[oneToOneMapping.toColumns.indexOf(mapping.column)].columnName;
                    splitArr = attrName.split('.');
                    splitArr.pop();
                    attrName = splitArr.join('.');
                }
            }
        }
        else {
            throw new ApatiteError('Invalid attribute: ' + this.expressionValue + ' in query. Only simple attributes can be used in query.');
        }
        var sqlExprs = [];
        sqlExprs.push(sqlBuilder.getOrCreateTableAliasName(attrName) + '.' + columnName);
        if (this.operatorExpression)
            sqlExprs.push(this.operatorExpression.buildExpressionForSQL(sqlBuilder, descriptor));

        if (this.valueExpression)
            sqlExprs.push(this.valueExpression.buildExpressionForSQL(sqlBuilder, descriptor));

        return sqlExprs.join(' ');
    }
}

module.exports = ApatiteAttributeExpression;