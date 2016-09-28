'use strict';

var should = require('chai').should();
var expect = require('chai').expect;

var ApatiteTestUtil = require('../apatite-test-util.js');


describe('ApatiteOneToOneQueryTest', function () {
    it('One To One Query Expr. Validity', function () {
        var util = new ApatiteTestUtil();
        var apatite = util.apatite;
        util.newSession(function (err, session) {
            var query = util.newQueryForDepartment(session);
            query.execute(function(err, departments) {
                query = util.newQueryForEmployee(session);
                query.attr('oid').gt(0).and;
                query.enclose.attr('department').eq(departments[0]);
                query.execute(function (err, firstDeptEmps) {
                    expect(firstDeptEmps.length).to.equal(2);
                    expect(firstDeptEmps[0]['name']).to.equal('Madhu');
                    expect(firstDeptEmps[1]['name']).to.equal('Scot');
                });
            });
        });


        //make sure matchesObject is called on one to one proxies in both resolved and not resolved cases
        util.newSession(function (err, session) {
            var query = util.newQueryForEmployee(session);
            query.execute(function (err, allEmployees) {
                expect(allEmployees.length).to.equal(4);
                allEmployees[0].department.getValue(function (dept) {//resolve proxy for first employee, the rest employees proxy would not be resolved.
                    query = util.newQueryForDepartment(session);
                    query.execute(function(err, departments) {
                        query = util.newQueryForEmployee(session);
                        query.attr('oid').gt(0).and;
                        query.enclose.attr('department').eq(departments[0]);
                        query.execute(function (err, firstDeptEmps) {
                            expect(firstDeptEmps.length).to.equal(2);
                            expect(firstDeptEmps[0]['name']).to.equal('Madhu');
                            expect(firstDeptEmps[1]['name']).to.equal('Scot');
                        });
                    });
                })

            });
        });
        util.newSession(function (err, session) {
            util.apatite.defaultCacheSize = 10;
            var query = util.newQueryForPerson(session);
            query.execute(function (err, people) {
                expect(people.length).to.equal(3); // all people are now in cache
                people[0].pet.getValue(function (pet) {//resolve proxy for first person, for the rest pet proxy would not be resolved.
                    expect(pet).to.eq(null);
                    query = util.newQueryForPerson(session);
                    query.attr('oid').gt(0).and;
                    query.enclose.attr('pet').eq(null);
                    query.execute(function(err, result) {
                        expect(result.length).to.equal(3);
                        util.apatite.defaultCacheSize = 0;
                    });
                });
            });
        });
    });

    it('One To One Query Validity', function () {
        var util = new ApatiteTestUtil();
        var apatite = util.apatite;
        util.autoRegisterModels = false;
        class Location {
            constructor() {
                this.oid = 0;
                this.id = '';
                this.name = '';
            }
        }

        var table = apatite.newTable('LOCATION');
        var modelDescriptor = apatite.newModelDescriptor(Location, table);
        
        var column = table.addNewColumn('OID', apatite.dialect.newIntegerType(10));
        column.bePrimaryKey();
        modelDescriptor.newSimpleMapping('oid', column);
        
        column = table.addNewColumn('ID', apatite.dialect.newVarCharType(15));
        modelDescriptor.newSimpleMapping('id', column);
        
        column = table.addNewColumn('NAME', apatite.dialect.newVarCharType(100));
        modelDescriptor.newSimpleMapping('name', column);


        class Department {
            constructor() {
                this.oid = 0;
                this.id = '';
                this.name = '';
                this.location = null;
            }
        }

        table = apatite.newTable('DEPT');
        var deptModelDescriptor = apatite.newModelDescriptor(Department, table);
        
        column = table.addNewColumn('OID', apatite.dialect.newIntegerType(10));
        column.bePrimaryKey();
        deptModelDescriptor.newSimpleMapping('oid', column);
        
        column = table.addNewColumn('ID', apatite.dialect.newVarCharType(15));
        deptModelDescriptor.newSimpleMapping('id', column);
        
        column = table.addNewColumn('NAME', apatite.dialect.newVarCharType(100));
        deptModelDescriptor.newSimpleMapping('name', column);
        
        column = table.addNewColumn('LOCATIONOID', apatite.dialect.newIntegerType(10));
        var locTable = apatite.getOrCreateTable('LOCATION');
        var locColumn = locTable.getColumn('OID');
        
        deptModelDescriptor.newOneToOneMapping('location', 'Location', [column], [locColumn]);

        class Employee {
            constructor() {
                this.oid = 0;
                this.id = '';
                this.name = '';
                this.department = null;
                this.location = null;
                this.secondaryLocation = null;
            }
        }

        table = apatite.newTable('EMP');
        var empModelDescriptor = apatite.newModelDescriptor(Employee, table);
        
        column = table.addNewColumn('OID', apatite.dialect.newIntegerType(10));
        column.bePrimaryKey();
        empModelDescriptor.newSimpleMapping('oid', column);
        
        column = table.addNewColumn('ID', apatite.dialect.newVarCharType(15));
        empModelDescriptor.newSimpleMapping('id', column);
        
        column = table.addNewColumn('NAME', apatite.dialect.newVarCharType(100));
        empModelDescriptor.newSimpleMapping('name', column);
        
        column = table.addNewColumn('DEPTOID', apatite.dialect.newIntegerType(10));
        var deptTable = apatite.getOrCreateTable('DEPT');
        var deptColumn = deptTable.getColumn('OID');
        if (!deptColumn)
            deptColumn = deptTable.addNewPrimaryKeyColumn('OID', apatite.dialect.newIntegerType(10));
        
        empModelDescriptor.newOneToOneMapping('department', 'Department', [column], [deptColumn]);
        
        column = table.addNewColumn('LOCATIONOID', apatite.dialect.newIntegerType(10));
        empModelDescriptor.newOneToOneMapping('location', 'Location', [column], [locColumn]);
        
        column = table.addNewColumn('SECLOCATIONOID', apatite.dialect.newIntegerType(10));
        empModelDescriptor.newOneToOneMapping('secondaryLocation', 'Location', [column], [locColumn]);
        
        util.newSession(function (err, session) {

            var query = apatite.newQuery(Employee);
            query.setSession(session);
            var sqlBuilder = apatite.dialect.getSelectSQLBuilder(query);

            query.fetchAttr('name');
            query.fetchAttr('department.name');

            expect(sqlBuilder.buildSQLStatement().sqlString).to.equal('SELECT T1.NAME AS "T1.NAME", T2.NAME AS "T2.NAME" FROM EMP T1, DEPT T2 WHERE T1.DEPTOID = T2.OID');

            query = apatite.newQuery(Employee).attr('department.name').eq('test');
            query.setSession(session);
            sqlBuilder = apatite.dialect.getSelectSQLBuilder(query);

            expect(sqlBuilder.buildSQLStatement().sqlString).to.equal('SELECT T1.OID AS "T1.OID", T1.ID AS "T1.ID", T1.NAME AS "T1.NAME", T1.DEPTOID AS "T1.DEPTOID", T1.LOCATIONOID AS "T1.LOCATIONOID", T1.SECLOCATIONOID AS "T1.SECLOCATIONOID" FROM EMP T1, DEPT T2 WHERE T1.DEPTOID = T2.OID AND T2.NAME = ?');
            expect(sqlBuilder.bindVariables[0].variableValue).to.equal('test');

            query = apatite.newQuery(Employee).fetchAttrs(['name', 'department.name', 'location.name', 'department.location.name']);
            query.setSession(session);
            sqlBuilder = apatite.dialect.getSelectSQLBuilder(query);
            expect(sqlBuilder.buildSQLStatement().sqlString).to.equal('SELECT T1.NAME AS "T1.NAME", T2.NAME AS "T2.NAME", T3.NAME AS "T3.NAME", T4.NAME AS "T4.NAME" FROM EMP T1, DEPT T2, LOCATION T3, LOCATION T4 WHERE T1.DEPTOID = T2.OID AND T1.LOCATIONOID = T3.OID AND T2.LOCATIONOID = T4.OID');

            query = apatite.newQuery(Employee).fetchAttrs(['name', 'location.name', 'secondaryLocation.name']);
            query.setSession(session);
            sqlBuilder = apatite.dialect.getSelectSQLBuilder(query);
            expect(sqlBuilder.buildSQLStatement().sqlString).to.equal('SELECT T1.NAME AS "T1.NAME", T2.NAME AS "T2.NAME", T3.NAME AS "T3.NAME" FROM EMP T1, LOCATION T2, LOCATION T3 WHERE T1.LOCATIONOID = T2.OID AND T1.SECLOCATIONOID = T3.OID');

            query = apatite.newQuery(Employee).fetchAttrs(['name', 'location.name', 'secondaryLocation.name']);
            query.setSession(session);
            session.execute(query, function (err, results) {
                expect(results.length).to.equal(4);
                expect(results[0]['name']).to.equal('Madhu');
                expect(results[0]['location.name']).to.equal('First Floor');
                expect(results[0]['secondaryLocation.name']).to.equal('First Floor');
            });

            query = apatite.newQuery(Employee).attr('department.oid').eq(0);
            query.setSession(session);
            query.fetchAttr('name');
            sqlBuilder = apatite.dialect.getSelectSQLBuilder(query);

            expect(sqlBuilder.buildSQLStatement().sqlString).to.equal('SELECT T1.NAME AS "T1.NAME" FROM EMP T1 WHERE T1.DEPTOID = ?');
            expect(sqlBuilder.bindVariables[0].variableValue).to.equal(0);

            query = apatite.newQuery(Employee).attr('department.location.oid').eq(0);
            query.setSession(session);
            query.fetchAttr('name');
            sqlBuilder = apatite.dialect.getSelectSQLBuilder(query);

            expect(sqlBuilder.buildSQLStatement().sqlString).to.equal('SELECT T1.NAME AS "T1.NAME" FROM EMP T1, DEPT T2 WHERE T1.DEPTOID = T2.OID AND T2.LOCATIONOID = ?');
            expect(sqlBuilder.bindVariables[0].variableValue).to.equal(0);

            query = apatite.newQuery(Employee).attr('department.location.oid').eq(0);
            query.setSession(session);
            query.fetchAttr('department.location.name');
            sqlBuilder = apatite.dialect.getSelectSQLBuilder(query);

            expect(sqlBuilder.buildSQLStatement().sqlString).to.equal('SELECT T2.NAME AS "T2.NAME" FROM EMP T1, DEPT T3, LOCATION T2 WHERE T1.DEPTOID = T3.OID AND T3.LOCATIONOID = T2.OID AND T3.LOCATIONOID = ?');
            expect(sqlBuilder.bindVariables[0].variableValue).to.equal(0);

            var newDepartment = new Department();
            newDepartment.name = 'Sales';
            newDepartment.oid = 20;
            query = session.newQuery(Employee).attr('department').eq(newDepartment);
            sqlBuilder = apatite.dialect.getSelectSQLBuilder(query);

            expect(sqlBuilder.buildSQLStatement().sqlString).to.equal('SELECT T1.OID AS "T1.OID", T1.ID AS "T1.ID", T1.NAME AS "T1.NAME", T1.DEPTOID AS "T1.DEPTOID", T1.LOCATIONOID AS "T1.LOCATIONOID", T1.SECLOCATIONOID AS "T1.SECLOCATIONOID" FROM EMP T1 WHERE ( T1.DEPTOID = ? )');
            expect(sqlBuilder.bindVariables[0].variableValue).to.equal(20);

            query = session.newQuery(Employee).attr('department').eq(null);
            sqlBuilder = apatite.dialect.getSelectSQLBuilder(query);

            expect(sqlBuilder.buildSQLStatement().sqlString).to.equal('SELECT T1.OID AS "T1.OID", T1.ID AS "T1.ID", T1.NAME AS "T1.NAME", T1.DEPTOID AS "T1.DEPTOID", T1.LOCATIONOID AS "T1.LOCATIONOID", T1.SECLOCATIONOID AS "T1.SECLOCATIONOID" FROM EMP T1 WHERE ( T1.DEPTOID = ? )');
            expect(sqlBuilder.bindVariables[0].variableValue).to.equal(null);

            var newLocation = new Location();
            newLocation.name = 'First Floor';
            newLocation.oid = 30;
            query = session.newQuery(Employee).attr('department.location').eq(newLocation);
            sqlBuilder = apatite.dialect.getSelectSQLBuilder(query);

            expect(sqlBuilder.buildSQLStatement().sqlString).to.equal('SELECT T1.OID AS "T1.OID", T1.ID AS "T1.ID", T1.NAME AS "T1.NAME", T1.DEPTOID AS "T1.DEPTOID", T1.LOCATIONOID AS "T1.LOCATIONOID", T1.SECLOCATIONOID AS "T1.SECLOCATIONOID" FROM EMP T1, DEPT T2 WHERE T1.DEPTOID = T2.OID AND ( T2.LOCATIONOID = ? )');
            expect(sqlBuilder.bindVariables[0].variableValue).to.equal(30);

            empModelDescriptor.getMappingForAttribute('location').beLeftOuterJoin();
            query = apatite.newQuery(Employee).fetchAttrs(['name', 'location.name', 'secondaryLocation.name']);
            query.setSession(session);
            sqlBuilder = apatite.dialect.getSelectSQLBuilder(query);
            expect(sqlBuilder.buildSQLStatement().sqlString).to.equal('SELECT T1.NAME AS "T1.NAME", T2.NAME AS "T2.NAME", T3.NAME AS "T3.NAME" FROM EMP T1, LOCATION T3 LEFT OUTER JOIN LOCATION T2 ON T1.LOCATIONOID = T2.OID WHERE T1.SECLOCATIONOID = T3.OID');

            empModelDescriptor.getMappingForAttribute('secondaryLocation').beLeftOuterJoin();
            query = apatite.newQuery(Employee).fetchAttrs(['name', 'location.name', 'secondaryLocation.name']);
            query.setSession(session);
            sqlBuilder = apatite.dialect.getSelectSQLBuilder(query);
            expect(sqlBuilder.buildSQLStatement().sqlString).to.equal('SELECT T1.NAME AS "T1.NAME", T2.NAME AS "T2.NAME", T3.NAME AS "T3.NAME" FROM EMP T1 LEFT OUTER JOIN LOCATION T2 ON T1.LOCATIONOID = T2.OID LEFT OUTER JOIN LOCATION T3 ON T1.SECLOCATIONOID = T3.OID');

            empModelDescriptor.getMappingForAttribute('department').beLeftOuterJoin();
            query = apatite.newQuery(Employee).attr('department.location.oid').eq(0);
            query.setSession(session);
            query.fetchAttr('department.location.name');
            sqlBuilder = apatite.dialect.getSelectSQLBuilder(query);

            expect(sqlBuilder.buildSQLStatement().sqlString).to.equal('SELECT T2.NAME AS "T2.NAME" FROM EMP T1, LOCATION T2 LEFT OUTER JOIN DEPT T3 ON T1.DEPTOID = T3.OID WHERE T3.LOCATIONOID = T2.OID AND T3.LOCATIONOID = ?');

            deptModelDescriptor.getMappingForAttribute('location').beLeftOuterJoin();
            query = apatite.newQuery(Employee).attr('department.location.oid').eq(0);
            query.setSession(session);
            query.fetchAttr('department.location.name');
            sqlBuilder = apatite.dialect.getSelectSQLBuilder(query);

            expect(sqlBuilder.buildSQLStatement().sqlString).to.equal('SELECT T2.NAME AS "T2.NAME" FROM EMP T1 LEFT OUTER JOIN DEPT T3 ON T1.DEPTOID = T3.OID LEFT OUTER JOIN LOCATION T2 ON T3.LOCATIONOID = T2.OID WHERE T3.LOCATIONOID = ?');

        });
    });
})
