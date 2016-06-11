'use strict';

var ApatiteObjectChangeSet = require('./apatite-object-change-set.js');
var ApatiteObjectBuilder = require('../model/apatite-object-builder.js');

class ApatiteChangeSet {
    constructor(session) {
        this.session = session;
        this.newObjects = new Set();
        this.deletedObjects = new Set();
        this.objectChangeSets = [];
    }

    compareStatements(firstStmt, secondStmt) {
        var sortedTableNames = this.session.apatite.sortedTableNames;
        var firstTableIdx = sortedTableNames.indexOf(firstStmt.tableName);
        var secondTableIdx = sortedTableNames.indexOf(secondStmt.tableName);

        return firstTableIdx - secondTableIdx;
    }

    buildDeleteStatements() {
        var statements = [];
        var dialect = this.session.apatite.dialect;
        var self = this;
        this.deletedObjects.forEach(function (eachObject) {
            var stmt = dialect.getDeleteSQLBuilder(self.session, eachObject).buildSQLStatement();
            stmt.object = eachObject;
            statements.push(stmt);
        });
        statements = statements.sort(function (firstStmt, secondStmt) {
            return self.compareStatements(firstStmt, secondStmt);
        });
        return statements;
    }

    buildUpdateStatements() {
        var statements = [];
        var dialect = this.session.apatite.dialect;
        for (var objIdx = 0; objIdx < this.objectChangeSets.length; objIdx++) {
            var objChangeSet = this.objectChangeSets[objIdx];
            var object = objChangeSet.object;
            var changedAttrNames = objChangeSet.getChangedAttrNames();
            var stmt = dialect.getUpdateSQLBuilder(this.session, object, changedAttrNames).buildSQLStatement();
            stmt.object = object;
            statements.push(stmt);

        }
        statements = statements.sort(function (firstStmt, secondStmt) {
            return self.compareStatements(firstStmt, secondStmt);
        });
        return statements;
    }

    buildInsertStatements() {
        var statements = [];
        var dialect = this.session.apatite.dialect;
        var self = this;
        this.registerOneToManyMappingsOfNewObjects();
        this.registerCascadeOfDeletedObjects();
        this.newObjects.forEach(function (eachObject) {
            var stmt = dialect.getInsertSQLBuilder(self.session, eachObject).buildSQLStatement();
            stmt.object = eachObject;
            statements.push(stmt);
        });
        statements = statements.sort(function (firstStmt, secondStmt) {
            return self.compareStatements(firstStmt, secondStmt);
        });
        return statements;
    }

    registerCascadeOfDeletedObjects() {
    }

    registerOneToManyMappingsOfNewObjects() {
        var self = this;
        this.newObjects.forEach(function (eachObject) {
            var descriptor = self.session.apatite.getModelDescriptor(eachObject.constructor.name);
            var mappings = descriptor.getOwnAndSuperClasMappings();
            mappings.forEach(function (eachMapping) {
                if (eachMapping.isOneToManyMapping()) {
                    var arr = eachObject[eachMapping.attributeName];
                    if (arr) {
                        for (var i = 0; i < arr.length; i++)
                            self.session.registerNew(arr[i]);
                    }
                }
            });
        });
    }

    save(onSaved) {
        var dialect = this.session.apatite.dialect;
        var allStatements = this.buildDeleteStatements();
        allStatements = allStatements.concat(this.buildInsertStatements());
        allStatements = allStatements.concat(this.buildUpdateStatements());

        var self = this;
        this.session.connection.executeStmtsInTransaction(allStatements, function (err) {
            if (err) {
                onSaved(err);
                return
            }

            self.session.removeObjectsFromCache(self.deletedObjects);
            self.definePropertiesForNewObjects();
            self.resetVariables();
            onSaved(null);
        });
    }

    definePropertiesForNewObjects() {
        var apatite = this.session.apatite;
        var session = this.session;
        this.newObjects.forEach(function (eachObject) {
            var descriptor = apatite.getModelDescriptor(eachObject.constructor.name);
            var objBuilder = new ApatiteObjectBuilder(session, null, null);
            objBuilder.setDescriptor(descriptor);
            objBuilder.initNewObject(eachObject, null);
        });
    }

    rollback() {
        var self = this;
        this.objectChangeSets.forEach(function (eachObjChangeSet) {
            eachObjChangeSet.rollback(self.session);
        });

        this.resetVariables();
    }

    resetVariables() {
        this.newObjects = new Set();
        this.deletedObjects = new Set();
        this.objectChangeSets = [];
    }

    getOrCreateObjectChangeSet(object) {
        var objChangeSet = null;
        for (var i = 0; i < this.objectChangeSets.length; i++) {
            if (this.objectChangeSets[i].object === object) {
                objChangeSet = this.objectChangeSets[i];
                break;
            }
        }
        if (objChangeSet === null) {
            objChangeSet = new ApatiteObjectChangeSet(object);
            this.objectChangeSets.push(objChangeSet);
        }

        return objChangeSet;
    }

    registerAttrValueChange(object, attrName, oldValue, isInstantiated) {
        this.getOrCreateObjectChangeSet(object).registerAttrValueChange(attrName, oldValue, isInstantiated);
    }

    registerDelete(object) {
        this.deletedObjects.add(object);
    }

    registerNew(object) {
        this.newObjects.add(object);
    }
}

module.exports = ApatiteChangeSet;