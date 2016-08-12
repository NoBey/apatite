'use strict';

var should = require('chai').should();
var expect = require('chai').expect;

var ApatiteTestUtil = require('../apatite-test-util.js');
var util = new ApatiteTestUtil();

describe('ApatiteChangeSetTest', function () {
    it('Change Set Validity', function () {
        //util.apatite.enableLogging();
        util.newSession(function (err, session) {
            var allPets = session.getAllObjectsInCache('Pet');
            expect(allPets.length).to.equal(0);

            var newPet = util.newPet();
            newPet.oid = 7;
            newPet.name = 'Parrot';

            (function () {
                session.registerNew(newPet);
            }).should.Throw('Cannot register object. Changes are not being tracked. Please use doChangesAndSave() to start tracking changes and save.');

            var changesToDo = function (changesDone) {
                session.registerNew(newPet);
                allPets = session.getAllObjectsInCache('Pet');
                expect(allPets.length).to.equal(0);
                changesDone();
            }
            var onSaved = function (err) {
                allPets = session.getAllObjectsInCache('Pet');
                expect(allPets.length).to.equal(1);
            }

            session.doChangesAndSave(changesToDo, onSaved);
        });
        
        util.newSession(function (err, session) {
            var newPet = util.newPet();
            newPet.oid = 7;
            newPet.name = 'Parrot';

            var newPerson = util.newPerson();
            newPerson.oid = 5;
            newPerson.name = 'ParrotOwner';
            newPerson.pet = newPet;

            var changesToDo = function (changesDone) {
                session.registerNew(newPerson);
                session.registerNew(newPet);

                var statements = session.changeSet.buildInsertStatements();
                expect(statements.length).to.equal(2);
                expect(statements[0].tableName).to.equal('PET');
                expect(statements[1].tableName).to.equal('PERSON');
                changesDone();
            }
            var onSaved = function (err) {
                var allPets = session.getAllObjectsInCache('Pet');
                expect(allPets.length).to.equal(1);

                var people = session.getAllObjectsInCache('Person');
                expect(people.length).to.equal(1);
            }

            session.doChangesAndSave(changesToDo, onSaved);
        });
        
        util.newSession(function (err, session) {
            var query = util.newQueryForPet(session);
            session.execute(query, function (err, pets) {
                var allPets = session.getAllObjectsInCache('Pet');
                expect(allPets.length).to.equal(4);

                session.doChangesAndSave(function (changesDone) {
                    session.registerDelete(allPets[0]);
                    changesDone();
                }, function (err) {
                    allPets = session.getAllObjectsInCache('Pet');
                    expect(allPets.length).to.equal(3);

                    session.doChangesAndSave(function (changesDone) {
                        var pet = util.newPet();
                        pet.name = 'Dog';
                        session.registerNew(pet);
                        changesDone();
                    }, function (err) {
                        allPets = session.getAllObjectsInCache('Pet');
                        expect(allPets.length).to.equal(4);
                    });
                });
                
            });
        });
        
        util.newSession(function (err, session) {
            var query = util.newQueryForPet(session);
            session.execute(query, function (err, pets) {
                var allPets = session.getAllObjectsInCache('Pet');
                var dog = allPets[0];
                expect(dog.name).to.equal('Dog');

                var changesToDo = function (changesDone) {
                    dog.name = 'DogXXXXXXXXXXXXXXX';
                    changesDone(null);
                };

                var onSaved = function (err) {
                    expect(err.message).to.equal('Update statement failed.');
                    expect(dog.name).to.equal('Dog'); // all changes must be rolled back
                }

                session.doChangesAndSave(changesToDo, onSaved);
            });
        });

        util.newSession(function (err, session) {
            var query = util.newQueryForPet(session);
            session.connection.failBeginTrans = true;
            session.execute(query, function (err, pets) {
                var allPets = session.getAllObjectsInCache('Pet');
                var dog = allPets[0];
                expect(dog.name).to.equal('Dog');

                var changesToDo = function (changesDone) {
                    dog.name = 'test';
                    changesDone(null);
                };

                var onSaved = function (err) {
                    session.connection.failBeginTrans = false;
                    expect(err.message).to.equal('Could not begin transaction.');
                    expect(dog.name).to.equal('Dog'); // all changes must be rolled back
                }

                session.doChangesAndSave(changesToDo, onSaved);
            });
        });

        util.newSession(function (err, session) {
            var query = util.newQueryForPet(session);
            session.connection.failCommitTrans = true;
            session.execute(query, function (err, pets) {
                var allPets = session.getAllObjectsInCache('Pet');
                var dog = allPets[0];
                expect(dog.name).to.equal('Dog');

                var changesToDo = function (changesDone) {
                    dog.name = 'test';
                    changesDone(null);
                };

                var onSaved = function (err) {
                    session.connection.failCommitTrans = false;
                    expect(err.message).to.equal('Could not commit transaction.');
                    expect(dog.name).to.equal('Dog'); // all changes must be rolled back
                }

                session.doChangesAndSave(changesToDo, onSaved);
            });
        });

        util.newSession(function (err, session) {
            var query = util.newQueryForPet(session);
            session.connection.failRollbackTrans = true;
            session.execute(query, function (err, pets) {
                var allPets = session.getAllObjectsInCache('Pet');
                var dog = allPets[0];
                expect(dog.name).to.equal('Dog');

                var changesToDo = function (changesDone) {
                    dog.name = 'DogXXXXXXXXXXXXXXX';
                    changesDone(null);
                };

                var onSaved = function (err) {
                    session.connection.failRollbackTrans = false;
                    expect(err.message).to.equal('Could not rollback transaction.');
                    expect(dog.name).to.equal('Dog'); // all changes must be rolled back
                }

                session.doChangesAndSave(changesToDo, onSaved);
            });
        });

        util.newSession(function (err, session) {
            var query = util.newQueryForPet(session);
            session.connection.failRollbackTrans = true;
            session.connection.failCommitTrans = true;
            session.execute(query, function (err, pets) {
                var allPets = session.getAllObjectsInCache('Pet');
                var dog = allPets[0];
                expect(dog.name).to.equal('Dog');

                var changesToDo = function (changesDone) {
                    dog.name = 'test';
                    changesDone(null);
                };

                var onSaved = function (err) {
                    session.connection.failRollbackTrans = false;
                    session.connection.failCommitTrans = false;
                    expect(err.message).to.equal('Could not rollback transaction.');
                    expect(dog.name).to.equal('Dog'); // all changes must be rolled back
                }

                session.doChangesAndSave(changesToDo, onSaved);
            });
        });

        util.newSession(function (err, session) {
            var query = util.newQueryForDepartment(session);
            session.execute(query, function (err, departments) {

                var changesToDo = function (changesDone) {
                    session.registerDelete(departments[2]);
                    changesDone(null);
                };

                var onSaved = function (err) {
                    expect(err.message).to.equal('Select statement failed.'); // error while cascading the children
                }

                session.doChangesAndSave(changesToDo, onSaved);
            });
        });
        
        util.newSession(function (err, session) {
            var query = util.newQueryForPet(session);
            session.execute(query, function (err, pets) {
                var allPets = session.getAllObjectsInCache('Pet');
                expect(allPets.length).to.equal(4);

                var people = session.getAllObjectsInCache('Person');
                expect(people.length).to.equal(0);

                var newPerson = util.newPerson();
                newPerson.oid = 5;
                newPerson.name = 'PetOwner';
                newPerson.pet = allPets[0];

                var changesToDo = function (changesDone) {
                    session.registerNew(newPerson);
                    changesDone();
                }
                var onSaved = function (err) {
                    people = session.getAllObjectsInCache('Person');
                    expect(people.length).to.equal(1);

                    session.startTrackingChanges();
                    people[0].name = 'Owner';
                    people[0].name = 'Owner2'; // Setting attribute more than once should always take the current value
                    allPets[0].name = 'PetX';

                    var statements = session.changeSet.buildUpdateStatements();
                    expect(statements.length).to.equal(2);
                    expect(statements[0].sqlString).to.equal('UPDATE PET SET NAME = ? WHERE OID = ?'); // even though the attribute of person has been first set, the update is issued for pet first becuase of the table sort order
                    expect(statements[0].bindings[0]).to.equal('PetX');
                    expect(statements[1].sqlString).to.equal('UPDATE PERSON SET NAME = ? WHERE OID = ?');
                    expect(statements[1].bindings[0]).to.equal('Owner2');
                    
                }
                session.doChangesAndSave(changesToDo, onSaved);
            });       
        });

    });

    it('One To N Change Set Validity', function () {

        util.newSession(function (err, session) {
            var query = util.newQueryForDepartment(session);
            session.execute(query, function (err, allDepartments) {
                expect(allDepartments.length).to.equal(3);
                var allEmployees = session.getAllObjectsInCache('Employee');
                expect(allEmployees.length).to.equal(0);

                var newEmployee = util.newEmployee();
                newEmployee.oid = 6;
                newEmployee.name = 'SomeEmp';
                newEmployee.department = allDepartments[0];

                var changesToDo = function (changesDone) {
                    session.registerNew(newEmployee);
                    changesDone();
                }
                var onSaved = function (err) {
                    allEmployees = session.getAllObjectsInCache('Employee');
                    expect(allEmployees.length).to.equal(1);

                    session.startTrackingChanges();
                    allEmployees[0].department = allDepartments[1];

                    var statements = session.changeSet.buildUpdateStatements();
                    expect(statements.length).to.equal(1);
                    expect(statements[0].sqlString).to.equal('UPDATE EMP SET DEPTOID = ? WHERE OID = ?');
                }

                session.doChangesAndSave(changesToDo, onSaved);
            });
        });


        util.newSession(function (err, session) {
            var query = util.newQueryForDepartment(session);
            session.execute(query, function (err, allDepartments) {
                expect(allDepartments.length).to.equal(3);

                var department = allDepartments[0];
                var newEmployee = util.newEmployee();
                newEmployee.oid = 6;
                newEmployee.name = 'SomeEmp';
                newEmployee.department = allDepartments[0];

                var changesToDo = function (changesDone) {
                    department.employees.add(function () {

                        var statements = session.changeSet.buildUpdateStatements();
                        expect(statements.length).to.equal(0);

                        statements = session.changeSet.buildInsertStatements();
                        expect(statements.length).to.equal(1);
                        expect(statements[0].sqlString).to.equal('INSERT INTO EMP (NAME, DEPTOID) VALUES (?, ?) RETURNING OID AS "OID"');
                        changesDone();
                    }, newEmployee);
                }

                var onSaved = function (err) {
                    session.startTrackingChanges();

                    department.employees.remove(function () {
                        var statements = session.changeSet.buildUpdateStatements();
                        expect(statements.length).to.equal(0);

                        statements = session.changeSet.buildInsertStatements();
                        expect(statements.length).to.equal(0);

                        statements = session.changeSet.buildDeleteStatements();
                        expect(statements.length).to.equal(1);
                        expect(statements[0].sqlString).to.equal('DELETE FROM EMP WHERE OID = ?');

                    }, newEmployee);
                }

                session.doChangesAndSave(changesToDo, onSaved);
            });
        });

        util.newSession(function (err, session) {
            var query = util.newQueryForDepartment(session);
            session.execute(query, function (err, allDepartments) {
                var changesToDo = function (changesDone) {
                    allDepartments[0].name = '';
                    delete allDepartments[0].name;
                    var statements = session.changeSet.buildUpdateStatements();
                    expect(statements.length).to.equal(1);
                    expect(statements[0].sqlString).to.equal('UPDATE DEPT SET NAME = ? WHERE OID = ?');
                    expect(statements[0].bindings[0]).to.equal(null);
                    expect(statements[0].bindings[1]).to.equal(1);
                    changesDone();
                }
                var onSaved = function (err) {
                }

                session.doChangesAndSave(changesToDo, onSaved);
            });
        });

        util.newSession(function (err, session) {
            var department = util.newDepartment();
            department.oid = 6;
            department.name = 'SomeDept';

            var newEmployee = util.newEmployee();
            newEmployee.oid = 6;
            newEmployee.name = 'SomeEmp';
            newEmployee.department = department;

            var changesToDo = function (changesDone) {
                department.employees.push(newEmployee);

                session.registerNew(department);

                var statements = session.changeSet.buildUpdateStatements();
                expect(statements.length).to.equal(0);

                statements = session.changeSet.buildInsertStatements();
                expect(statements.length).to.equal(2);

                statements = session.changeSet.buildDeleteStatements();
                expect(statements.length).to.equal(0);
                changesDone();
            }
            var onSaved = function (err) {
                session.startTrackingChanges();
                department.employees.remove(function (err) {
                    var statements = session.changeSet.buildUpdateStatements();
                    expect(statements.length).to.equal(0);

                    statements = session.changeSet.buildInsertStatements();
                    expect(statements.length).to.equal(0);

                    statements = session.changeSet.buildDeleteStatements();
                    expect(statements.length).to.equal(1);
                    expect(statements[0].sqlString).to.equal('DELETE FROM EMP WHERE OID = ?');
                }, newEmployee);
            }

            session.doChangesAndSave(changesToDo, onSaved);
        });

        util.newSession(function (err, session) {
            var query = util.newQueryForDepartment(session);
            session.execute(query, function (err, allDepartments) {
                expect(allDepartments.length).to.equal(3);

                var department = allDepartments[0];
                department.employees.getValue(function (empLoadErr, employees) {
                    expect(employees.length).to.equal(2);
                    var allEmployees = session.getAllObjectsInCache('Employee');
                    expect(allEmployees.length).to.equal(2);
                    var changesToDo = function (changesDone) {
                        session.registerDelete(department) // employees should be deleted as well because of the cascade on delete option
                        changesDone()
                    }

                    var onSaved = function (err) {
                        expect(session.getAllObjectsInCache('Department').length).to.equal(2);
                        expect(session.getAllObjectsInCache('Employee').length).to.equal(0);
                    }

                    session.doChangesAndSave(changesToDo, onSaved);
                })

            });
        });

    });
})