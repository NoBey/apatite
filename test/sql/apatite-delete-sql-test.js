'use strict';

var should = require('chai').should();
var expect = require('chai').expect;

var ApatiteTestUtil = require('../apatite-test-util.js');
var util = new ApatiteTestUtil();

describe('ApatiteDeleteSQLTest', function () {
    it('Delete SQL Validity', function () {
        util.newSession(function (err, session) {

            var query = util.newQueryForPet(session);
            session.execute(query, function (err, allPets) {
                var sqlBuilder = util.apatite.dialect.getDeleteSQLBuilder(session, allPets[0]);
                expect(sqlBuilder.buildSQLStatement().sqlString).to.equal('DELETE FROM PET WHERE OID = ?');
            });
        });
    });
})