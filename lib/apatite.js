/*!
 * Apatite
 * Copyright(c) 2016 Madhu <pmadhur@gmail.com>
 * MIT Licensed
 */

'use strict';

var ApatiteConfigError = require('./error/apatite-config-error');
var ApatiteTable = require('./database/apatite-table');
var ApatiteModelDescriptor = require('./model/apatite-model-descriptor');
var ApatiteSession = require('./session/apatite-session');
var ApatiteQuery = require('./query/apatite-query.js');
var ApatiteTypeFilterQuery = require('./query/apatite-type-filter-query.js');
var ApatiteToManyOrderByQuery = require('./query/apatite-to-many-order-by-query.js');
var ApatitePostgresDialect = require('./database/postgres/apatite-postgres-dialect.js');
var ApatiteOracleDialect = require('./database/oracle/apatite-oracle-dialect.js');
var ApatiteMysqlDialect = require('./database/mysql/apatite-mysql-dialect.js');
var ApatiteUtil = require('./util.js');
var assert = require('assert');

class Apatite {
    constructor(dialect) {
        this.registeredDescriptors = {};
        this.allTables = {};
        this.sortedTableNames = [];
        this.dialect = dialect;
        dialect.apatite = this;
        this.defaultCacheSize = 0;
        this.loggingEnabled = false;
        this.isPrepared = false;
    }

    enableLogging() {
        this.loggingEnabled = true;
    }

    disableLogging() {
        this.loggingEnabled = false;
    }

    useConnectionPool() {
        this.dialect.useConnectionPool = true;
    }

    closeConnectionPool(onConnectionClosed) {
        this.dialect.closeConnectionPool(onConnectionClosed);
    }

    newSession(onNewSessionCreated) {
        try {
            this.prepare();
        } catch(ex) {
            return onNewSessionCreated(ex);
        }
        
        var self = this;
        this.dialect.connect(function (err, connection) {
            if (err) {
                onNewSessionCreated(err);
                return;
            }
            var newSession = new ApatiteSession(self, connection);
            onNewSessionCreated(null, newSession);
        });
    }

    static for(dialectClass, connectionOptions) {
        var moduleName = dialectClass.getModuleName();
        if (!ApatiteUtil.existsModule(moduleName))
            throw new Error(`Module "${moduleName}" not found.`);

        return new Apatite(new dialectClass(connectionOptions));
    }

    static forPostgres(connectionOptions) {
        return this.for(ApatitePostgresDialect, connectionOptions);
    }

    static forOracle(connectionOptions) {
        return this.for(ApatiteOracleDialect, connectionOptions);
    }

    static forMysql(connectionOptions) {
        return this.for(ApatiteMysqlDialect, connectionOptions);
    }

    getModelDescriptor(modelOrModelName) {
        if (this.isClass(modelOrModelName))
            return this.registeredDescriptors[modelOrModelName.name];
        else
            return this.registeredDescriptors[modelOrModelName];
    }

    getModelDescriptors() {
        var modelDescriptors = [];
        for (var eachModelName in this.registeredDescriptors)
            modelDescriptors.push(this.registeredDescriptors[eachModelName]);

        return modelDescriptors;
    }

    prepare() {
        if (this.isPrepared)
            return;

        var descr = this.getModelDescriptors();
        var self = this;
        this.getModelDescriptors().forEach(function (eachDescriptor) {
            eachDescriptor.validate();
            var currTableName = eachDescriptor.table.tableName;
            var currTableIdx = self.sortedTableNames.indexOf(currTableName);
            eachDescriptor.getOwnMappings().forEach(function (eachMapping) {
                if (eachMapping.isOneToOneMapping()) {
                    var oneToOneIdx = self.sortedTableNames.indexOf(eachMapping.toColumns[0].table.tableName);
                    if (currTableIdx < oneToOneIdx) {
                        var firstPart = self.sortedTableNames.slice(0, oneToOneIdx + 1);
                        var secondPart = self.sortedTableNames.slice(oneToOneIdx + 1);
                        firstPart.splice(currTableIdx, 1);
                        firstPart.push(currTableName);
                        self.sortedTableNames = firstPart.concat(secondPart);
                    }
                }
            });
        });
        this.isPrepared = true;
    }

    newQuery(model) {
        return new ApatiteQuery(this, model);
    }

    newToManyOrderQuery() {
        return new ApatiteToManyOrderByQuery(this);
    }

    newTypeFilterQuery() {
        return new ApatiteTypeFilterQuery(this);
    }

    getOrCreateTable(tableName) {
        if (this.allTables[tableName])
            return this.allTables[tableName];
        else
            return this.newTable(tableName);
    }

    getTable(tableName) {
        return this.allTables[tableName];
    }

    newTable(tableName) {
        if (this.allTables[tableName])
            throw new ApatiteConfigError('Table: ' + tableName + ' already exists.');

        var newTable = new ApatiteTable(tableName);
        this.allTables[tableName] = newTable;
        this.sortedTableNames.push(tableName);

        return newTable;
    }

    newModelDescriptor(model, table) {
        var descriptor = new ApatiteModelDescriptor(model, table);
        this.registerModelDescriptor(descriptor);
        return descriptor;
    }

    newDescriptorFromObject(object) {
        var table = this.getOrCreateTable(object.table)
        var descriptor = this.newModelDescriptor(object.model, table);
        descriptor.createMappingsFromObject(object)
        return descriptor;
    }

    registerModel(model) {
        this.validateModel(model);

        if (typeof model.getModelDescriptor !== 'function')
            throw new ApatiteConfigError('getModelDescriptor not defined in model: ' + model.name + '. Define a static function named getModelDescriptor to register model.');

        var modelDescriptor = model.getModelDescriptor(this);
        this.basicRegisterModelDescriptor(modelDescriptor);
    }

    registerModelDescriptor(modelDescriptor) {
        if ((!modelDescriptor) || (modelDescriptor.constructor.name !== 'ApatiteModelDescriptor'))
            throw new ApatiteConfigError('Model descriptor provided to register is invalid. Please provide a valid model descriptor.');

        this.validateModel(modelDescriptor.model);
        this.basicRegisterModelDescriptor(modelDescriptor);
    }

    basicRegisterModelDescriptor(modelDescriptor) {
        modelDescriptor.apatite = this;
        this.registeredDescriptors[modelDescriptor.model.name] = modelDescriptor;
    }

    isClass(func) {
        return typeof func === 'function'
            && /^class\s/.test(Function.prototype.toString.call(func));
    }

    validateModel(model) {
        if (!model)
            throw new ApatiteConfigError('Model provided to register is invalid. Please provide a valid model.');

        if (!this.isClass(model))
            throw new ApatiteConfigError('Model provided is not a valid ES6 class.');

        var modelName = model.name;

        if (this.registeredDescriptors[modelName])
            throw new ApatiteConfigError('Model ' + modelName + ' already registered.');

    }
}

module.exports = Apatite;