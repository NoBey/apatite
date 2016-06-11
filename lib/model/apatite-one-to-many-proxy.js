'use strict';

var ApatiteOneToOneProxy = require('./apatite-one-to-one-proxy');

class ApatiteOneToManyProxy extends ApatiteOneToOneProxy {
    constructor(query) {
        super(query);
    }

    getInitValueForObject() {
        return [];
    }

    setValueFromQueryResult(result) {
        this.setValue(result);
    }

    getLength(onLengthFetched) {
        this.getValue(function (err, result) {
            if (err)
                onLengthFetched(err);
            else
                onLengthFetched(null, result.length);
        });
    }

    getAtIndex(idx, onValueFetched) {
        this.getValue(function (err, result) {
            if (err)
                onValueFetched(err);
            else
                onValueFetched(null, result[idx]);
        });
    }

    indexOf(object, onIndexFetched) {
        this.getValue(function (err, result) {
            if (err)
                onIndexFetched(err);
            else
                onIndexFetched(null, result.indexOf(object));
        });
    }

    add(onObjectsAdded, ...objectsToAdd) {
        var self = this;
        this.getValue(function (err, result) {
            if (err)
                onObjectsAdded(err);
            else {
                result.push(...objectsToAdd);
                for (var i = 0; i < objectsToAdd.length; i++) {
                    self.query.session.registerNew(objectsToAdd[i]);
                }
                onObjectsAdded(null);

            }
        });
    }

    remove(onObjectsRemoved, ...objectsToRemove) {
        var self = this;
        this.getValue(function (err, result) {
            if (err)
                onObjectsRemoved(err);
            else {
                for (var i = 0; i < objectsToRemove.length; i++) {
                    var objToRemove = objectsToRemove[i];
                    var objIdx = result.indexOf(objToRemove);
                    if (objIdx === -1)
                        throw new Error('Object not found in apatite Array');

                    result.splice(objIdx, 1);

                    self.query.session.registerDelete(objToRemove);
                }
                onObjectsRemoved(null);
            }
        });
    }

    removeAll(onAllRemoved) {
        var self = this;
        this.getValue(function (err, result) {
            if (err)
                onAllRemoved(err);
            else {
                while (result.length !== 0) {
                    self.remove(result[0]);
                };
                onAllRemoved(null);
            }
        });
    }

    forEach(callback, thisArg) {
        this.getValue(function (err, result) {
            if (err)
                throw err;
            else
                result.forEach(callback, thisArg);
        });
    }

}

module.exports = ApatiteOneToManyProxy;