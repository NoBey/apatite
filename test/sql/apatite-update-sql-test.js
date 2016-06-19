'use strict';

var should = require('chai').should();
var expect = require('chai').expect;

var ApatiteTestUtil = require('../apatite-test-util.js');
var util = new ApatiteTestUtil();
var ApatiteObjectChangeSet = require('../../lib/session/apatite-object-change-set.js');

describe('ApatiteUpdateSQLTest', function () {
    it('Update SQL Validity', function () {
        util.newSession(function (err, session) {

            var query = util.newQueryForPet(session);
            session.execute(query, function (err, allPets) {
                session.startTrackingChanges();
                allPets[0].name = 'Dog'
                var sqlStmt = session.changeSet.buildUpdateStatements()[0];
                expect(sqlStmt.sqlString).to.equal('UPDATE PET SET NAME = ? WHERE OID = ?');
                var bindings = sqlStmt.bindings;
                expect(bindings.length).to.equal(2);
                expect(bindings[0]).to.equal('Dog');
                expect(bindings[1]).to.equal(1);
            });
        });
    });
    it('Relative Column Validity', function () {

        util.newSession(function (err, session) {

            var query = util.newQueryForProduct(session);
            session.execute(query, function (err, allProducts) {
                session.startTrackingChanges();
                allProducts[0].quantity = 20
                var sqlStmt = session.changeSet.buildUpdateStatements()[0];
                expect(sqlStmt.sqlString).to.equal('UPDATE PRODUCT SET QUANTITY = QUANTITY + ? WHERE OID = ?');
                var bindings = sqlStmt.bindings;
                expect(bindings.length).to.equal(2);
                expect(bindings[0]).to.equal(-80);
                expect(bindings[1]).to.equal(1);
            });
        });
    });
})