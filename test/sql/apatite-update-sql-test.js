'use strict';

var should = require('chai').should();
var expect = require('chai').expect;

var ApatiteTestUtil = require('../apatite-test-util.js');
var util = new ApatiteTestUtil();

describe('ApatiteUpdateSQLTest', function () {
    it('Update SQL Validity', function () {
        util.newSession(function (err, session) {

            var query = util.newQueryForPet(session);
            session.execute(query, function (err, allPets) {
                var sqlBuilder = util.apatite.dialect.getUpdateSQLBuilder(session, allPets[0], ['name']);
                var sqlStmt = sqlBuilder.buildSQLStatement();
                expect(sqlStmt.sqlString).to.equal('UPDATE PET SET NAME = ? WHERE OID = ?');
                var bindings = sqlStmt.bindings;
                expect(bindings.length).to.equal(2);
                expect(bindings[0]).to.equal('Dog');
                expect(bindings[1]).to.equal(1);
            });

            query = util.newQueryForPerson(session);
            session.execute(query, function (err, people) {
                var sqlBuilder = util.apatite.dialect.getUpdateSQLBuilder(session, people[0], ['name', 'pet']);
                var sqlStmt = sqlBuilder.buildSQLStatement();
                expect(sqlStmt.sqlString).to.equal('UPDATE PERSON SET NAME = ?, PETOID = ? WHERE OID = ?');
                var bindings = sqlStmt.bindings;
                expect(bindings.length).to.equal(3);
                expect(bindings[0]).to.equal('Madhu');
                expect(bindings[1]).to.equal(null);
                expect(bindings[2]).to.equal(1);
            });
        });
    });
})