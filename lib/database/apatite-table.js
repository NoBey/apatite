'use strict';

var ApatiteConfigError = require('../error/apatite-config-error');
var ApatiteColumn = require('../database/apatite-column');

class ApatiteTable
{
    constructor(tableName) {
        this.tableName = tableName;
        this.columns = {};
        this.primaryKeyColumns = {};
    }

    addNewColumn(columnName, dataType) {
        return new ApatiteColumn(columnName, this, dataType);
    }

    addNewPrimaryKeyColumn(columnName, dataType) {
        var column = this.addNewColumn(columnName, dataType);
        column.bePrimaryKey();
        return column;
    }

    getColumn(columnName) {
        return this.columns[columnName];
    }

    addColumn(column) {
        column.validate();
        if (this.columns[column.columnName])
            throw new ApatiteConfigError('Column: ' + column.columnName + ' already exists in table: ' + this.tableName + '.');

        this.columns[column.columnName] = column;
    }

    addPrimaryKeyColumn(column) {
        column.validate();
        if (this.primaryKeyColumns[column.columnName])
            throw new ApatiteConfigError('Column: ' + column.columnName + ' already defined as primary key in table: ' + this.tableName + '.');

        this.primaryKeyColumns[column.columnName] = column;
    }

    getColumns() {
        var columnsArr = [];
        for (var eachColumnName in this.columns)
            columnsArr.push(this.columns[eachColumnName]);

        return columnsArr;
    }

    getPrimaryKeyColumns() {
        var primaryKeysArr = [];
        for (var eachColumnName in this.primaryKeyColumns)
            primaryKeysArr.push(this.primaryKeyColumns[eachColumnName]);

        return primaryKeysArr;
    }

    validate() {
        if (!this.tableName)
            throw new ApatiteConfigError('Invalid table name.');

        if (this.getColumns().length === 0)
            throw new ApatiteConfigError('No columns defined for table: ' + this.tableName + '.');

        var pkColumns = this.getPrimaryKeyColumns();
        if (pkColumns.length === 0)
            throw new ApatiteConfigError('No primary key columns defined for table: ' + this.tableName + '.');

        pkColumns.forEach(function (eachColumn) {
            if (eachColumn.isOneToOneColumn)
                throw new ApatiteConfigError('One to one columns cannot be defined as part of the primary key for table: ' + this.tableName + '.');
        }, this);
    }
}

module.exports = ApatiteTable;