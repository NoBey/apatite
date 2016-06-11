'use strict';

var should = require('chai').should();
var expect = require('chai').expect;

var ApatiteTestUtil = require('../apatite-test-util.js');
var util = new ApatiteTestUtil();

describe('ApatiteSimpleQueryTest', function () {
    it('Simple Query Validity', function () {
        var apatite = util.apatite;
        class User {
            constructor() {
                this.oid = 0;
                this.id = '';
                this.name = '';
            }
        }

        var table = apatite.newTable('USERS');
        var modelDescriptor = apatite.newModelDescriptor(User, table);
        
        var column = table.addNewColumn('OID', apatite.dialect.newIntegerType(10));
        column.bePrimaryKey();
        modelDescriptor.newSimpleMapping('oid', column);
        
        column = table.addNewColumn('ID', apatite.dialect.newVarCharType(15));
        modelDescriptor.newSimpleMapping('id', column);
        
        column = table.addNewColumn('NAME', apatite.dialect.newVarCharType(100));
        modelDescriptor.newSimpleMapping('name', column);
        
        class InvalidModel {

        }
        
        util.newSession(function (err, session) {

            (function () {
                var qry = apatite.newQuery(InvalidModel);
                session.execute(qry, function () { });
            }).should.Throw('Descriptor for model: InvalidModel not found.');

            (function () {
                apatite.newQuery();
            }).should.Throw('A valid model is required for query.');

            var query = apatite.newQuery(User);
            query.setSession(session);
            var sqlBuilder = apatite.dialect.getSelectSQLBuilder(query);

            expect(sqlBuilder.buildSQLStatement().sqlString).to.equal('SELECT T1.OID, T1.ID, T1.NAME FROM USERS T1');

            query = apatite.newQuery(User).attr('name').eq('test');
            query.setSession(session);
            sqlBuilder = apatite.dialect.getSelectSQLBuilder(query);

            var sqlStatement = sqlBuilder.buildSQLStatement();
            expect(sqlStatement.sqlString).to.equal('SELECT T1.OID, T1.ID, T1.NAME FROM USERS T1 WHERE T1.NAME = ?');
            expect(sqlStatement.bindings[0]).to.equal('test');


            query = apatite.newQuery(User);
            query.attr('name').eq('test').and.attr('id').eq('tom');
            query.setSession(session);
            sqlBuilder = apatite.dialect.getSelectSQLBuilder(query);

            sqlStatement = sqlBuilder.buildSQLStatement();
            expect(sqlStatement.sqlString).to.equal('SELECT T1.OID, T1.ID, T1.NAME FROM USERS T1 WHERE T1.NAME = ? AND T1.ID = ?');
            expect(sqlStatement.bindings[0]).to.equal('test');
            expect(sqlStatement.bindings[1]).to.equal('tom');


            query = apatite.newQuery(User);
            query.attr('name').eq('test').or.attr('id').eq('tom');
            query.setSession(session);
            sqlBuilder = apatite.dialect.getSelectSQLBuilder(query);

            sqlStatement = sqlBuilder.buildSQLStatement();
            expect(sqlStatement.sqlString).to.equal('SELECT T1.OID, T1.ID, T1.NAME FROM USERS T1 WHERE T1.NAME = ? OR T1.ID = ?');
            expect(sqlStatement.bindings[0]).to.equal('test');
            expect(sqlStatement.bindings[1]).to.equal('tom');

            query = apatite.newQuery(User);
            query.enclose.attr('name').eq('tom').or.attr('name').eq('jerry');
            query.and.enclose.attr('id').eq('x').or.attr('id').eq('y');

            query.setSession(session);
            sqlBuilder = apatite.dialect.getSelectSQLBuilder(query);
            sqlStatement = sqlBuilder.buildSQLStatement();
            expect(sqlStatement.sqlString).to.equal('SELECT T1.OID, T1.ID, T1.NAME FROM USERS T1 WHERE ( T1.NAME = ? OR T1.NAME = ? ) AND ( T1.ID = ? OR T1.ID = ? )');
            expect(sqlStatement.bindings[0]).to.equal('tom');
            expect(sqlStatement.bindings[1]).to.equal('jerry');
            expect(sqlStatement.bindings[2]).to.equal('x');
            expect(sqlStatement.bindings[3]).to.equal('y');

            query = apatite.newQuery(User);
            query.setSession(session);
            sqlBuilder = apatite.dialect.getSelectSQLBuilder(query);
            query.fetchAttr('names');

            (function () {
                sqlBuilder.buildSQLStatement();
            }).should.Throw('Mapping for attribute: names not found in model: User.');


            query = apatite.newQuery(User);
            query.setSession(session);
            sqlBuilder = apatite.dialect.getSelectSQLBuilder(query);
            query.fetchAttr('name');

            expect(sqlBuilder.buildSQLStatement().sqlString).to.equal('SELECT T1.NAME FROM USERS T1');

            query = apatite.newQuery(User);
            query.setSession(session);
            sqlBuilder = apatite.dialect.getSelectSQLBuilder(query);
            query.fetchAttrs(['id', 'name']);

            expect(sqlBuilder.buildSQLStatement().sqlString).to.equal('SELECT T1.ID, T1.NAME FROM USERS T1');

            query = apatite.newQuery(User);
            query.setSession(session);
            query.attr('name').eq('test').and.attr('oid').eq(1);
            sqlBuilder = apatite.dialect.getSelectSQLBuilder(query);
            query.fetchAttr('name');

            sqlStatement = sqlBuilder.buildSQLStatement();
            expect(sqlStatement.sqlString).to.equal('SELECT T1.NAME FROM USERS T1 WHERE T1.NAME = ? AND T1.OID = ?');
            expect(sqlStatement.bindings[0]).to.equal('test');
            expect(sqlStatement.bindings[1]).to.equal(1);
        });
    });
})