var expect = require('chai').expect;

module.exports.setUp = function (done, util, onSetupFinished) {
    //this.timeout(5000);
    util.createTestTables(function (err) {
        expect(err).to.not.exist;
        util.newSession(function (sessErr, sess) {
            expect(sessErr).to.not.exist;
            onSetupFinished(sess);
            done();
        });
    });
}

module.exports.tearDown = function (done, util, session) {
    //this.timeout(5000);
    util.deleteTestTables(function (err) {
        expect(err).to.not.exist;
        session.end(function (endErr) {
            expect(endErr).to.not.exist;
            done();
        });
    });
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


        //util.apatite.enableLogging();

        var onEmpRemovalSaved = function (saveErr) {
            expect(saveErr).to.not.exist;
            session.connection.executeSQLString('select oid as "oid", name as "name" from emp', [], function (sqlErr, result) {
                expect(sqlErr).to.not.exist;
                expect(result.rows.length).to.equal(0);
                done();
            }, sqlOptions);
        }

        var changesToDo = function (changesDone) {
            newDepartment.employees.remove(function (err) { changesDone(); }, newEmployee);
        }

        var onEmpSelectFetched = function (err, result) {
            expect(err).to.not.exist;
            expect(result.rows.length).to.equal(1);
            expect(result.rows[0].name).to.equal('SomeEmp');

            session.doChangesAndSave(changesToDo, onEmpRemovalSaved);
        }

        var onDeptSelectFetched = function (err, deptResult) {
            expect(err).to.not.exist;
            expect(deptResult.rows.length).to.equal(1);
            expect(deptResult.rows[0].name).to.equal('XDept');

            session.connection.executeSQLString('select oid as "oid", name as "name" from emp', [], onEmpSelectFetched, sqlOptions);
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
                session.connection.executeSQLString('select oid as "oid", name as "name" from dept', [], onDeptSelectFetched, sqlOptions);
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
            session.connection.executeSQLString('select oid as "oid", name as "name" from dept', [], onFirstDeptSelectFetched, sqlOptions);
        });

    });
}