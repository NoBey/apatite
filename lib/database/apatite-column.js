'use strict';

var ApatiteConfigError = require('../error/apatite-config-error');

class ApatiteColumn
{
    constructor(columnName, table, dataType) {
        this.columnName = columnName;
        this.table = table;
        this.dataType = dataType;
        this.isPrimaryKey = false;
        this.isOneToOneColumn = false;
        this.hasRelativeUpdate = false;
        table.addColumn(this);
        this.toDBConverter = function (value) {
            return value;
        }
        this.toObjectConverter = function (value) {
            return value;
        }
    }

    beRelativeUpdate() {
        this.hasRelativeUpdate = true;
    }

    bePrimaryKey() {
        this.isPrimaryKey = true;
        this.table.addPrimaryKeyColumn(this);
    }

    setConverters(toDBConverter, toObjectConverter) {
        this.toDBConverter = toDBConverter;
        this.toObjectConverter = toObjectConverter;
    }

    convertValueForObject(value) {
        return this.toObjectConverter(value);
    }

    convertValueForDB(value) {
        return this.toDBConverter(value);
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