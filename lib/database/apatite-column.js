'use strict';

var ApatiteConfigError = require('../error/apatite-config-error');

class ApatiteColumn
{
    constructor(columnName, table, dataType) {
        this.columnName = columnName;
        this.table = table;
        this.dataType = dataType;
        this.isPrimaryKey = false;
        table.addColumn(this);
    }

    bePrimaryKey() {
        this.isPrimaryKey = true;
        this.table.addPrimaryKeyColumn(this);
    }

    convertValueForDB(value) {
        return value;
    }

    validate() {
        if (!this.columnName)
            throw new ApatiteConfigError('Column name invalid.');

        if (!this.dataType)
            throw new ApatiteConfigError('Column: ' + this.columnName + ' data type invalid.');

        this.dataType.validate(this);
    }
}

module.exports = ApatiteColumn;