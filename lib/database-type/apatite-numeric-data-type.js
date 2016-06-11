'use strict';

var ApatiteDataType = require('./apatite-data-type.js');
var ApatiteConfigError = require('../error/apatite-config-error');

class ApatiteNumericDataType extends ApatiteDataType {
    constructor(length) {
        super(length);
    }
    validate(column) {
        super.validate(column);

        if (!this.isSerialType() && !this.length)
            throw new ApatiteConfigError('Invalid length specified for column: ' + column.columnName + ' in table ' + column.table.tableName + '.');
    }
}

module.exports = ApatiteNumericDataType;