'use strict';

var ApatiteObjectBuilder = require('../model/apatite-object-builder.js');
var ApatiteQuery = require('../query/apatite-query.js');
var ApatiteChangeSet = require('./apatite-change-set.js');
var ApatiteCache = require('./apatite-cache.js');
var ApatiteError = require('../error/apatite-error.js');
var ApatiteAttributeListBuilder = require('../model/apatite-attribute-list-builder.js');

class ApatiteSession {
    constructor(apatite, connection) {
        this.apatite = apatite;
        this.connection = connection;
        this.changeSet = new ApatiteChangeSet(this);
        this.cache = {};
        this.trackingChanges = false;
        this.changesAndSaveQueue = [];
    }

    end(onSessionEnded) {
        this.connection.disconnect(onSessionEnded);
        this.connection = null;
        this.changeSet = null;
        this.apatite = null;
        this.cache = null;
    }

    newQuery(model) {
        var newQuery = this.apatite.newQuery(model);
        newQuery.setSession(this);
        return newQuery;
    }

    execute(query, onExecuted) {
        this.checkForSubQuery(query);
        query.setSession(this);
        try {
            query.validate();
        } catch (error) {
            if (onExecuted) {
                onExecuted(error);
                return this;
            } else {
                return Promise.reject(error);
            }
        }
        if (query.hasOnlyPrimaryKeyExpressions()) {
            var descriptor = query.getModelDescriptor();
            var dummyObject = {};
            query.setPropOnObjectForCacheKey(dummyObject);
            var queryIsValid = true;
            for(var prop in dummyObject)
                if ((dummyObject[prop] === null) || (dummyObject[prop] === undefined))
                    queryIsValid = false;
            if (queryIsValid) {
                var cacheKey = descriptor.buildCacheKeyFromObject(dummyObject);
                var object = this.findObjectInCache(descriptor.model.name, cacheKey);
                if (object !== null) {
                    if (onExecuted) {
                        onExecuted(null, [object]);
                        return this;
                    } else {
                        return Promise.resolve([object]);
                    }
                }
            }
        }
        if (onExecuted) {
            this.connection.executeQuery(query, onExecuted);
            return this;
        }
        var self = this;
        return new Promise(function (resolve, reject) {
            self.connection.executeQuery(query, function (err, value) {
                if (err)
                    reject(err);
                else
                    resolve(value);
            });
        });
    }

    checkForSubQuery(query) {
        if (query.isSubQuery)
            throw new ApatiteError('Trying to execute a sub query which is not allowed. Create and store the query in a variable and then do chaining of expressions. Example: query = session.newQuery(Person); attr("name").eq("test").or.attr("id").eq("tom");');
    }

    getAllObjectsInCache(modelName) {
        var modelCache = this.cache[modelName];
        if (!modelCache)
            return [];

        return modelCache.getAllObjects();
    }

    findObjectInCache(modelName, cacheKey) {
        var modelCache = this.cache[modelName];
        if (!modelCache)
            return null;

        return modelCache.getObjectAtKey(cacheKey);
    }

    clearCache() {
        this.cache = {};
    }

    putObjectInCache(modelName, cacheKey, object) {
        var modelCache = this.cache[modelName];
        if (!modelCache) {
            modelCache = new ApatiteCache(this.apatite.defaultCacheSize);
            this.cache[modelName] = modelCache;
        }

        modelCache.putObjectAtKey(object, cacheKey);
    }

    removeObjectsFromCache(objects) {
        var self = this;
        objects.forEach(function (eachObject) {
            var modelName = eachObject.constructor.name;
            var modelCache = self.cache[modelName];
            if (modelCache)
                modelCache.removeObject(eachObject);
        });
    }

    buildObjectForRow(tableRow, query) {
        return (new ApatiteObjectBuilder(this, tableRow, query)).buildObject();
    }

    buildAttrListForRow(tableRow, query) {
        return (new ApatiteAttributeListBuilder(this, tableRow, query)).buildAttrList();
    }

    ensureChangesBeingTracked() {
        if (!this.trackingChanges)
            throw new ApatiteError('Cannot register object. Changes are not being tracked. Please use doChangesAndSave() to start tracking changes and save.');
    }

    registerNew(object) {
        this.ensureChangesBeingTracked();
        this.changeSet.registerNew(object);
    }

    registerDelete(object) {
        this.ensureChangesBeingTracked();
        this.changeSet.registerDelete(object);
    }

    onAttrValueChanged(object, attrName, oldValue) {
        if (!this.trackingChanges)
            return;

        this.changeSet.registerAttrValueChange(object, attrName, oldValue);
    }

    startTrackingChanges() {
        this.trackingChanges = true;
    }

    doChangesAndSave(changesToDo, onChangesSaved) {
        this.basicDoChangesAndSave(changesToDo, onChangesSaved);
        /*var self = this
        var promise = new Promise(function (resolve, reject) {
            self.basicDoChangesAndSave(changesToDo, function (saveErr) {
                if (saveErr)
                    reject(saveErr)
                else
                    resolve()
            })
        })
        if (arguments.length === 1)
            return promise;
        else {
            promise.then(function () {
                onChangesSaved(null)
            }, function (err) {
                onChangesSaved(err)
            })
        }*/
    }

    basicDoChangesAndSave(changesToDo, onChangesSaved) {
        this.changesAndSaveQueue.push({changesToDo: changesToDo, onChangesSaved: onChangesSaved});
        if (this.changesAndSaveQueue.length === 1)
            this.processChangesAndSaveQueue();
    }

    processChangesAndSaveQueue() {
        if (this.changesAndSaveQueue.length === 0)
            return;

        var queueInfo = this.changesAndSaveQueue.shift();
        if (this.trackingChanges)
            return queueInfo.onChangesSaved(new ApatiteError('Previous changes have not been saved. Probably the callback done() of changesToDo parameter of method doChangesAndSave(changesToDo, onChangesSaved) is not called.'));

        this.startTrackingChanges();
        var self = this;

        queueInfo.changesToDo(function (err) {
            if (err) {
                self.rollbackChanges();
                queueInfo.onChangesSaved(err);
            }
            else
                self.saveChanges(queueInfo.onChangesSaved);
        });
    }

    saveChanges(onChangesSaved) {
        var self = this;
        this.changeSet.save(function (err) {
            if (err) {
                self.rollbackChanges();
                onChangesSaved(err);
            }
            else {
                self.stopTrackingChanges();
                onChangesSaved(null);
            }
            self.processChangesAndSaveQueue();
        });
    }

    basicStopTrackingChanges() {
        this.trackingChanges = false;
    }

    initChangeSet() {
        this.changeSet = new ApatiteChangeSet(this);
    }

    stopTrackingChanges() {
        this.basicStopTrackingChanges();
        this.initChangeSet();
    }

    rollbackChanges() {
        this.basicStopTrackingChanges();
        this.changeSet.rollback(); // must be done after stopping to track changes because the rollback sets object properties
        this.initChangeSet();
    }
}

module.exports = ApatiteSession;