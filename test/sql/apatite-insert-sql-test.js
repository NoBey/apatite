'use strict';

var should = require('chai').should();
var expect = require('chai').expect;

var ApatiteTestUtil = require('../apatite-test-util.js');
var util = new ApatiteTestUtil();

describe('ApatiteInsertSQLTest', function () {
    it('Insert SQL Validity', function () {
        util.newSession(function (err, session) {

            var newPet = util.newPet();
            newPet.name = 'Dog';
            var sqlBuilder = util.apatite.dialect.getInsertSQLBuilder(session, newPet);
            var sqlStmt = sqlBuilder.buildSQLStatement();
            expect(sqlStmt.sqlString).to.equal('INSERT INTO PET (NAME) VALUES (?) RETURNING OID AS "OID"');

            var newPerson = util.newPerson();
            newPerson.oid = 10;
            newPerson.name = 'Sudan';
            var query = util.newQueryForPet(session);
            session.execute(query, function (err, allPets) {
                sqlBuilder = util.apatite.dialect.getInsertSQLBuilder(session, newPerson);
                sqlStmt = sqlBuilder.buildSQLStatement();
                expect(sqlStmt.sqlString).to.equal('INSERT INTO PERSON (OID, NAME, PETOID) VALUES (?, ?, ?)');
                var bindings = sqlStmt.bindings;
                expect(bindings.length).to.equal(3);
                expect(bindings[0].variableValue).to.equal(10);
                expect(bindings[1].variableValue).to.equal('Sudan');
                expect(bindings[2].variableValue).to.equal(null);

                newPerson.pet = allPets[0];
                sqlBuilder = util.apatite.dialect.getInsertSQLBuilder(session, newPerson);
                sqlStmt = sqlBuilder.buildSQLStatement();
                expect(sqlStmt.sqlString).to.equal('INSERT INTO PERSON (OID, NAME, PETOID) VALUES (?, ?, ?)');
                var bindings = sqlStmt.bindings;
                expect(bindings.length).to.equal(3);
                expect(bindings[0].variableValue).to.equal(10);
                expect(bindings[1].variableValue).to.equal('Sudan');
                expect(bindings[2].variableValue).to.equal(1);
            });
        });
    });
})