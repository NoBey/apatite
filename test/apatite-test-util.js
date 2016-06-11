﻿'use strict';

var Apatite = require('../lib/apatite');
var ApatiteTestDialect = require('./database/apatite-test-dialect.js');

var Department = require('./test-models/department.js');
var Employee = require('./test-models/employee.js');

var Pet = require('./test-models/pet.js');
var Person = require('./test-models/person.js');

var Shape = require('./test-models/shape.js');
var ShapeWithVertex = require('./test-models/shape-with-vertex.js');
var Circle = require('./test-models/circle.js');
var SemiCircle = require('./test-models/semi-circle.js');

class ApatiteTestUtil {
    constructor() {
        this.apatite = this.newApatite();
        this.autoRegisterModels = true;
    }

    newApatite() {
        return new Apatite(new ApatiteTestDialect({ userName: 'apatite', password: 'test' }));
    }

    registerTestModels() {
        if (!this.autoRegisterModels)
            return;

        this.apatite.registerModel(Department);
        this.apatite.registerModel(Employee);
        this.apatite.registerModel(Pet);
        this.apatite.registerModel(Person);

        this.apatite.registerModel(Shape);
        this.apatite.registerModel(ShapeWithVertex);
        this.apatite.registerModel(Circle);
        this.apatite.registerModel(SemiCircle);
    }

    newPet() {
        return new Pet();
    }

    newPerson() {
        return new Person();
    }

    newEmployee() {
        return new Employee();
    }

    newDepartment() {
        return new Department();
    }

    newQueryForDepartment(session) {
        return session.newQuery(Department);
    }

    newQueryForEmployee(session) {
        return session.newQuery(Employee);
    }

    newQueryForPet(session) {
        return session.newQuery(Pet);
    }

    newQueryForPerson(session) {
        return session.newQuery(Person);
    }

    newQueryForShape(session) {
        return session.newQuery(Shape);
    }

    newQueryForShapeWithVertex(session) {
        return session.newQuery(ShapeWithVertex);
    }

    newQueryForCircle(session) {
        return session.newQuery(Circle);
    }

    newQueryForSemiCircle(session) {
        return session.newQuery(SemiCircle);
    }

    newSession(onSessionCreated) {
        this.registerTestModels();
        var self = this;
        this.apatite.newSession(function (err, session) {
            onSessionCreated(err, session);
            self.autoRegisterModels = false;
        });
    }

    createTestTables(onTablesCreated) {
        var self = this;
        this.newSession(function (err, session) {
            session.connection.executeStatements(self.getCreateTableStatements(), function (err, result) {
                if (err) {
                    onTablesCreated(err);
                    return;
                }
                session.end(function (endErr) {
                    onTablesCreated(endErr);
                });
            });
        });
    }

    deleteTestTables(onTablesDropped) {
        var self = this;
        this.newSession(function (err, session) {
            session.connection.executeStatements(self.getDropTableStatements(), function (err, result) {
                if (err) {
                    onTablesDropped(err);
                    return;
                }
                session.end(function (endErr) {
                    onTablesDropped(endErr);
                });
            });
        });
    }

}

module.exports = ApatiteTestUtil;