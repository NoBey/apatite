'use strict'

var ApatiteError = require('../error/apatite-error.js');

class ApatiteSQLScriptCreator {
    constructor(apatite) {
        this.apatite = apatite
    }

    static forApatite(apatite) {
        return new ApatiteSQLScriptCreator(apatite)
    }

    createScriptForAllModels() {
        var sql = ''
        var self = this
        var descriptorSQLs = []
        this.apatite.getModelDescriptors().forEach(function(eachDescriptor) {
            descriptorSQLs.push(self.createScriptForDescriptor(eachDescriptor))
        })
        sql += descriptorSQLs.join('\r\n')
        return sql
    }

    createScriptForModel(modelOrModelName) {
        var descriptor = this.getDescriptor(modelOrModelName)
        return this.createScriptForDescriptor(descriptor)
    }

    createScriptForDescriptor(descriptor) {
        var table = descriptor.table
        var dialect = this.apatite.dialect
        var sql = this.buildCreateTableSQL(table)

        sql += ' ('

        var colSqls = []
        var self = this
        table.getColumns().forEach(function(eachColumn) {
            colSqls.push(self.buildColumnDefSQL(eachColumn))
        })

        sql += colSqls.join(', ')

        sql += ');'

        return sql
    }

    createScriptForAttribute(modelOrModelName, attributeName) {
        var descriptor = this.getDescriptor(modelOrModelName)
        var sql = 'ALTER TABLE ' + descriptor.table.tableName + ' ADD ('
        var colSqls = []
        var self = this
        descriptor.getMappingForAttribute(attributeName).getMappedColumns().forEach(function(eachColumn) {
            colSqls.push(self.buildColumnDefSQL(eachColumn))
        })
        sql += colSqls.join(', ')
        sql += ');'
        return sql
    }

    getDescriptor(modelOrModelName) {
        var descriptor = this.apatite.getModelDescriptor(modelOrModelName)
        if (!descriptor)
            throw new ApatiteError(`Descriptor for model "${this.apatite.isClass(modelOrModelName) ? modelOrModelName.name : modelOrModelName}" not found.`)
        return descriptor
    }

    buildCreateTableSQL(table) {
        return 'CREATE TABLE ' + table.tableName
    }

    buildColumnDefSQL(column) {
        var dialect = this.apatite.dialect
        var sql = column.columnName + ' '
        var dataType = column.dataType
        sql += dataType.dialectDataType
        if (dataType.length) {
            sql += ' ('
            sql += dataType.length
            if (dataType.precision)
                sql += ', ' + dataType.precision

            sql += ')'
        }

        if (!dataType.nullAllowed)
            sql += ' NOT NULL'

        if (dataType.isSerialType())
            sql += dialect.buildColumnSerialTypeDefSQL(column)

        if (column.isPrimaryKey)
            sql += ' ' + dialect.buildColumnPKDefSQL(column)

        return sql
    }
}


module.exports = ApatiteSQLScriptCreator