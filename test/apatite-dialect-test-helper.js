var expect = require('chai').expect;

module.exports.setUp = function (done, util, onSetupFinished) {
    var connOptions = util.apatite.dialect.connectionOptions;
    var oriUserName = connOptions.userName;
    connOptions.userName = ':/foo_and_bar';
    util.newSession(function (invalidSessionErr, invalidSession) {
        expect(invalidSessionErr).to.exist;
        connOptions.userName = oriUserName;
        util.createTestTables(function (err) {
            expect(err).to.not.exist;
            util.newSession(function (sessErr, sess) {
                expect(sessErr).to.not.exist;
                onSetupFinished(sess);
                done();
            });
        });
    });

}

module.exports.tearDown = function (done, util, session) {
    util.deleteTestTables(function (err) {
        expect(err).to.not.exist;
        session.end(function (endErr) {
            expect(endErr).to.not.exist;
            done();
        });
    });
}

module.exports.failSQLTest = function (done, session, util) {
    var sqlOptions = { isApatiteDirectSql: true, resultSet: true };
    var onExecuted = function(err, result) {
        expect(err).to.exist;
        done();
    }
    session.connection.executeSQLString('select invalid sql statement from DEPT', [], onExecuted, sqlOptions)
}

module.exports.testFunction = function (done, session, util) {
    var query = util.newQueryForDepartment(session);
    var sqlOptions = { isApatiteDirectSql: true, resultSet: true };
    session.execute(query, function (err, departments) {
        expect(departments.length).to.equal(0);

        var newDepartment = util.newDepartment();
        newDepartment.name = 'SomeDept';

        var newEmployee = util.newEmployee();
        newEmployee.name = 'SomeEmp';
        newEmployee.department = newDepartment;

        var onEmpRemovalSaved = function (saveErr) {
            expect(saveErr).to.not.exist;
            session.connection.executeSQLString('select oid as "oid", name as "name" from EMP', [], function (sqlErr, result) {
                expect(sqlErr).to.not.exist;
                expect(result.rows.length).to.equal(0);

                session.doChangesAndSave(function (changesDone) {
                    newDepartment = util.newDepartment();
                    newDepartment.name = '12345678901234567890123456789012345678901234567890123456789012345678901234567890'; // > 50
                    session.registerNew(newDepartment);
                    changesDone();
                }, function (err) {
                    if (!util.apatite.dialect.ignoreDataTypeLength)
                        expect(err).to.exist;
                    doCursorStreamTests(done, session, util);
                });
            }, sqlOptions);
        }

        var changesToDo = function (changesDone) {
            newDepartment.employees.remove(function (err) { changesDone(); }, newEmployee);
        }

        var onEmpSelectFetched = function (err, result) {
            expect(err).to.not.exist;
            expect(result.rows.length).to.equal(1);
            expect(result.rows[0].name).to.equal('SomeEmp');

            var query2 = util.newQueryForEmployee(session);
            query2.returnCursorStream = true;
            query2.execute(function (execErr, cursorStream) {
                cursorStream.on('error', function(cursorErr) {
                    expect(cursorErr).to.not.exist;
                });
                cursorStream.on('result', function(emp) {
                    expect(emp.name).to.equal('SomeEmp');
                });
                cursorStream.on('end', function() {
                    session.doChangesAndSave(changesToDo, onEmpRemovalSaved);
                });
            });
        }

        var onDeptSelectFetched = function (err, deptResult) {
            expect(err).to.not.exist;
            expect(deptResult.rows.length).to.equal(1);
            expect(deptResult.rows[0].name).to.equal('XDept');

            session.connection.executeSQLString('select oid as "oid", name as "name" from EMP', [], onEmpSelectFetched, sqlOptions);
        }

        var onFirstDeptSelectFetched = function (err, result) {
            expect(err).to.not.exist;
            expect(result.rows.length).to.equal(1);
            expect(result.rows[0].name).to.equal('SomeDept');

            session.doChangesAndSave(function (changesDone) {
                newDepartment.name = 'XDept';
                changesDone();
            }, function (saveErr) {
                expect(saveErr).to.not.exist;
                session.connection.executeSQLString('select oid as "oid", name as "name" from DEPT', [], onDeptSelectFetched, sqlOptions);
            });
        }

        session.doChangesAndSave(function (changesDone) {
            newDepartment.employees.push(newEmployee);
            session.registerNew(newDepartment);
            changesDone();
        }, function (saveErr) {
            expect(saveErr).to.not.exist;
            expect(newDepartment.oid).to.equal(1);
            expect(newEmployee.oid).to.equal(1);
            session.connection.executeSQLString('select oid as "oid", name as "name" from DEPT', [], onFirstDeptSelectFetched, sqlOptions);
        });

    });
}

function doCursorStreamTests(done, session, util) {
    var query = util.newQueryForNonExistentTable(session);
    query.returnCursorStream = true;
    query.execute(function (execErr, cursorStream) {
        cursorStream.on('error', function(cursorErr) {
            expect(cursorErr).to.exist;
            done();
        });
    });
}