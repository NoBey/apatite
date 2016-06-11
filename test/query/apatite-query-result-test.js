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
})