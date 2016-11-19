'use strict';

var should = require('chai').should();
var expect = require('chai').expect;

var ApatiteTestUtil = require('../apatite-test-util.js');
var util = new ApatiteTestUtil();

describe('ApatiteQueryResultTest', function () {
    it('Query Result Validity', function () {
        util.newSession(function (err, session) {
            var query = util.newQueryForPet(session);
            session.execute(query, function (err, allPets) {
                expect(allPets.length).to.equal(4);
                expect(allPets[0].oid).to.equal(1);
                expect(allPets[0].name).to.equal('Dog');
                expect(allPets[1].oid).to.equal(2);
                expect(allPets[1].name).to.equal('Cat');
                expect(allPets[2].oid).to.equal(3);
                expect(allPets[2].name).to.equal('Mouse');
            });

            query = util.newQueryForPerson(session);
            session.execute(query, function (err, people) {
                expect(people.length).to.equal(3);
                expect(people[0].oid).to.equal(1);
                expect(people[0].name).to.equal('Madhu');
                people[0].pet.getValue(function (err, pet) {
                    expect(pet).to.equal(null);
                });
                
                expect(people[1].oid).to.equal(2);
                expect(people[1].name).to.equal('Sam');
                people[1].pet.getValue(function (err, pet) {
                    expect(pet.oid).to.equal(1);
                    expect(pet.name).to.equal('Dog');
                });

                
                expect(people[2].oid).to.equal(3);
                expect(people[2].name).to.equal('Peter');
                people[2].pet.getValue(function (err, pet) {
                    expect(pet.oid).to.equal(2);
                    expect(pet.name).to.equal('Cat');
                });
            });

            query = util.newQueryForPerson(session).attr('name').eq('test').or.attr('id').eq('tom');

            (function () {
                session.execute(query, function (err, people) {
                });
            }).should.Throw('Trying to execute a sub query which is not allowed. Create and store the query in a variable and then do chaining of expressions. Example: query = session.newQuery(Person); attr("name").eq("test").or.attr("id").eq("tom");');
        });
    });
    it('Fetch Attributes Validity', function () {
        util.newSession(function (err, session) {
            var query = util.newQueryForPet(session);
            query.fetchAttr('name');
            util.apatite.enableLogging();
            session.execute(query, function (err, petNames) {
                util.apatite.disableLogging();
                expect(petNames.length).to.equal(4);
                expect(petNames[0].name).to.equal('Dog');
                expect(petNames[1].name).to.equal('Cat');
                expect(petNames[2].name).to.equal('Mouse');
            });

            query = util.newQueryForPet(session);
            query.fetchAttr('nameXEE');
            session.execute(query, function (err, petNames) {
                expect(err.message).to.equal('Mapping for attribute: nameXEE not found in model: Pet.');
            });

            query = util.newQueryForPet(session);
            query.fetchAttr('name');
            session.connection.failCursor = true;
            session.execute(query, function (err, petNames) {
                session.connection.failCursor = false;
                expect(err.message).to.equal('Cursor failure.');
            });
        });
    });
    it('Cursor Stream Validity', function (done) {
        util.newSession(function (err, session) {
            var query = util.newQueryForPet(session);
            query.fetchAttr('name');
            query.returnCursorStream = true;
            session.connection.failCursor = true;
            session.execute(query, function (err, cursorStream) {
                session.connection.failCursor = false;
                cursorStream.on('error', function(cursorErr) {
                    expect(cursorErr.message).to.equal('Cursor failure.');
                    done();
                })
            });
        });
    });
    it('Column Converter Validity', function () {
        var column = util.apatite.getTable('PET').getColumn('NAME')
        column.setConverters(function (value) {
            return value === 'Lion' ? 'Cat' : value
        }, function (value) {
            return value === 'Cat' ? 'Lion' : value
        })
        util.newSession(function (err, session) {
            var query = util.newQueryForPet(session);
            query.fetchAttr('name');
            session.execute(query, function (err, petNames) {
                expect(petNames[0].name).to.equal('Dog');
                expect(petNames[1].name).to.equal('Lion');
                expect(petNames[2].name).to.equal('Mouse');
            });

            query = util.newQueryForPet(session);
            session.execute(query, function (err, allPets) {
                expect(allPets[1].oid).to.equal(2);
                expect(allPets[1].name).to.equal('Lion');
            });

            query = util.newQueryForPet(session);
            query.attr('name').eq('Lion');
            var sqlBuilder = util.apatite.dialect.getSelectSQLBuilder(query);
            var sqlStatement = sqlBuilder.buildSQLStatement();
            expect(sqlStatement.sqlString).to.equal('SELECT T1.OID AS "T1.OID", T1.NAME AS "T1.NAME" FROM PET T1 WHERE T1.NAME = ?');
            expect(sqlStatement.bindings[0].variableValue).to.equal('Cat');

            query = util.newQueryForPerson(session);
            query.fetchAttrs(['name', 'pet.name']);
            session.execute(query, function (err, peoplePetNames) {
                expect(peoplePetNames[2].name).to.equal('Peter');
                expect(peoplePetNames[2]['pet.name']).to.equal('Lion');
            });

            query = util.newQueryForPerson(session);
            query.attr('pet.name').eq('Lion');
            sqlBuilder = util.apatite.dialect.getSelectSQLBuilder(query);
            sqlStatement = sqlBuilder.buildSQLStatement();
            expect(sqlStatement.sqlString).to.equal('SELECT T1.OID AS "T1.OID", T1.NAME AS "T1.NAME", T1.PETOID AS "T1.PETOID" FROM PERSON T1, PET T2 WHERE T1.PETOID = T2.OID AND T2.NAME = ?');
            expect(sqlStatement.bindings[0].variableValue).to.equal('Cat');
        });
    })
})