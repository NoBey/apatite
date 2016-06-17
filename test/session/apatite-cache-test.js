'use strict';

var should = require('chai').should();
var expect = require('chai').expect;

var ApatiteTestUtil = require('../apatite-test-util.js');
var util = new ApatiteTestUtil();

describe('ApatiteCacheTest', function () {
    it('Cache Validity', function () {
        util.newSession(function (err, session) {

            //ensure all objects loaded in cache
            var query = util.newQueryForPet(session);
            session.execute(query, function (err, allPets) {
                expect(allPets.length).to.equal(4);
                var pet = session.findObjectInCache('Pet', '1');
                expect(pet).to.equal(allPets[0]);
                pet = session.findObjectInCache('Pet', '2');
                expect(pet).to.equal(allPets[1]);
                pet = session.findObjectInCache('Pet', '3');
                expect(pet).to.equal(allPets[2]);
                pet = session.findObjectInCache('Pet', '4');
                expect(pet).to.equal(allPets[3]);
                pet = session.findObjectInCache('Pet', '5');
                expect(pet).to.equal(null);
            });
            expect(session.connection.sqlCount).to.equal(1);
            util.apatite.defaultCacheSize = 2;
            session.clearCache();
            //if the cache size reached its capacity, remove objects which were inserted first
            session.execute(query, function (err, allPets) {
                expect(allPets.length).to.equal(4);
                var pet = session.findObjectInCache('Pet', '1');
                expect(pet).to.equal(null);
                pet = session.findObjectInCache('Pet', '2');
                expect(pet).to.equal(null);
                pet = session.findObjectInCache('Pet', '3');
                expect(pet).to.equal(allPets[2]);
                pet = session.findObjectInCache('Pet', '4');
                expect(pet).to.equal(allPets[3]);
            });
            util.apatite.defaultCacheSize = 100;
            session.clearCache();

            expect(session.connection.sqlCount).to.equal(2);
            //lazy loading of one-to-one mappings
            query = util.newQueryForPerson(session);
            session.execute(query, function (err, people) {
                expect(people.length).to.equal(3);
                var person = session.findObjectInCache('Person', '1');
                expect(person).to.equal(people[0]);
                person.pet.getValue(function (err, nullPet) {
                    expect(nullPet).to.equal(null);

                    person = session.findObjectInCache('Person', '2');
                    var pet = session.findObjectInCache('Pet', '1');
                    expect(pet).to.equal(null); // When loading person, pet should not be loaded from DB
                    expect(person).to.equal(people[1]);

                    person.pet.getValue(function (err, validPet) {
                        expect(validPet.oid).to.equal(1); // pet should be loaded now from DB
                        pet = session.findObjectInCache('Pet', '1');
                        expect(person.pet.basicGetValue()).to.equal(pet);

                        person = session.findObjectInCache('Person', '3');
                        pet = session.findObjectInCache('Pet', '2');
                        expect(pet).to.equal(null);
                        expect(person).to.equal(people[2]);
                    });
                });
                
            });
            expect(session.connection.sqlCount).to.equal(5);
            session.clearCache();
            query = util.newQueryForPet(session);
            //ensure objects are retured from cache if the where expression matches
            session.execute(query, function (err, allPets) {
                expect(allPets.length).to.equal(4); // all pets are now in cache
                //console.log(allPets[0].name);
                allPets[0]['someProp'] = 'someValue';
                var nameQuery = util.newQueryForPet(session);
                nameQuery.attr('name').eq('Dog');
                session.execute(nameQuery, function (err, dogs) {
                    expect(dogs.length).to.equal(1);
                    expect(dogs[0]['someProp']).to.equal('someValue');
                });
                session.clearCache();
                session.execute(nameQuery, function (err, dogs) {
                    expect(dogs.length).to.equal(1);
                    expect(dogs[0]['someProp']).to.equal(undefined);
                });
            });

            expect(session.connection.sqlCount).to.equal(8);
            session.clearCache();
            query = util.newQueryForPet(session).attr('name').eq('Dog');
            session.execute(query, function (err, allPets) {
                expect(allPets.length).to.equal(1);

                allPets[0].name = 'DogX';

                query = util.newQueryForPet(session).attr('name').eq('Dog');
                session.execute(query, function (err, allPets2) {
                    expect(allPets2.length).to.equal(0);

                    var pet = session.findObjectInCache('Pet', '1');
                    expect(pet.name).to.equal('DogX');

                    pet.name = 'Dog';

                    query = util.newQueryForPet(session).attr('name').eq('Dog');
                    session.execute(query, function (err, allPets3) {
                        expect(allPets3.length).to.equal(1);
                        session.connection.sqlCount = 0;
                        query = util.newQueryForPet(session).attr('oid').eq(1);
                        session.execute(query, function (err, petsInCache) {
                            expect(session.connection.sqlCount).to.equal(0); // no sql should be issued because pet with oid 1 is already in the cache.
                            expect(petsInCache.length).to.equal(1);
                        })
                    });
                });
            });
        });
    });

    it('One To Many Cache Validity', function () {
        util.newSession(function (err, session) {
            var allDepartments = session.getAllObjectsInCache('Department');
            expect(allDepartments.length).to.equal(0);

            var allEmployees = session.getAllObjectsInCache('Employee');
            expect(allEmployees.length).to.equal(0);

            var query = util.newQueryForDepartment(session);
            session.execute(query, function (err, departments) {
                allDepartments = session.getAllObjectsInCache('Department');
                expect(allDepartments.length).to.equal(3);

                allEmployees = session.getAllObjectsInCache('Employee');
                expect(allEmployees.length).to.equal(0);

                allDepartments[0].employees.getValue(function (err, employees) {
                    expect(employees.length).to.equal(2);

                    allEmployees = session.getAllObjectsInCache('Employee');
                    expect(allEmployees.length).to.equal(2);
                });
            });
        });
    });
})