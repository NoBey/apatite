'use strict';

var should = require('chai').should();
var expect = require('chai').expect;

var ApatiteTestUtil = require('../apatite-test-util.js');
var util = new ApatiteTestUtil();

describe('ApatiteExpressionTest', function () {
    it('Comparision Validity', function () {
        util.newSession(function (err, session) {
            var query = util.newQueryForBook(session);
            session.execute(query, function (err, books) {

                 query = util.newQueryForBook(session);
                 query.attr('name').like('L%');
                 expect(query.matchesObject(books[0])).to.equal(true);
                 expect(query.matchesObject(books[1])).to.equal(false);
                 expect(query.matchesObject(books[2])).to.equal(true);

                 query = util.newQueryForBook(session);
                 query.attr('name').notLike('L%');
                 expect(query.matchesObject(books[0])).to.equal(false);
                 expect(query.matchesObject(books[1])).to.equal(true);
                 expect(query.matchesObject(books[2])).to.equal(false);

                 query = util.newQueryForBook(session);
                 query.attr('numberOfPages').gt(120);
                 expect(query.matchesObject(books[0])).to.equal(true);
                 expect(query.matchesObject(books[1])).to.equal(false);
                 expect(query.matchesObject(books[2])).to.equal(false);

                 query = util.newQueryForBook(session);
                 query.attr('numberOfPages').ge(120);
                 expect(query.matchesObject(books[0])).to.equal(true);
                 expect(query.matchesObject(books[1])).to.equal(false);
                 expect(query.matchesObject(books[2])).to.equal(true);

                 query = util.newQueryForBook(session);
                 query.attr('numberOfPages').lt(120);
                 expect(query.matchesObject(books[0])).to.equal(false);
                 expect(query.matchesObject(books[1])).to.equal(true);
                 expect(query.matchesObject(books[2])).to.equal(false);

                 query = util.newQueryForBook(session);
                 query.attr('numberOfPages').le(120);
                 expect(query.matchesObject(books[0])).to.equal(false);
                 expect(query.matchesObject(books[1])).to.equal(true);
                 expect(query.matchesObject(books[2])).to.equal(true);

                 query = util.newQueryForBook(session);
                 query.attr('numberOfPages').ne(120);
                 expect(query.matchesObject(books[0])).to.equal(true);
                 expect(query.matchesObject(books[1])).to.equal(true);
                 expect(query.matchesObject(books[2])).to.equal(false);

                 query = util.newQueryForBook(session);
                 query.attr('numberOfPages').isNULL();
                 expect(query.matchesObject(books[0])).to.equal(false);
                 expect(query.matchesObject(books[1])).to.equal(false);
                 expect(query.matchesObject(books[2])).to.equal(false);

                 query = util.newQueryForBook(session);
                 query.attr('numberOfPages').isNOTNULL();
                 expect(query.matchesObject(books[0])).to.equal(true);
                 expect(query.matchesObject(books[1])).to.equal(true);
                 expect(query.matchesObject(books[2])).to.equal(true);

                 /*query = util.newQueryForBook(session);
                 query.attr('numberOfPages').in(120, 150);
                 expect(query.matchesObject(books[0])).to.equal(true);
                 expect(query.matchesObject(books[1])).to.equal(false);
                 expect(query.matchesObject(books[2])).to.equal(true);*/

                 query = util.newQueryForBook(session); //
                 query.attr('numberOfPages').newComparision('', 'SOME_INVALID_OPERATOR_');

                (function () {
                    query.matchesObject(books[0]);
                }).should.Throw('Not expected to reach here.');
            });
        });
    });

    it('Order By Validity', function () {
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

        util.newSession(function (err, session) {

            var query = apatite.newQuery(User);
            query.setSession(session);
            query.orderBy('name');
            var sqlBuilder = apatite.dialect.getSelectSQLBuilder(query);
            expect(sqlBuilder.buildSQLStatement().sqlString).to.equal('SELECT T1.OID AS "T1.OID", T1.ID AS "T1.ID", T1.NAME AS "T1.NAME" FROM USERS T1 ORDER BY T1.NAME');

            query = apatite.newQuery(User);
            query.setSession(session);
            query.attr('name').eq('test').orderBy('name').asc();
            sqlBuilder = apatite.dialect.getSelectSQLBuilder(query);
            query.fetchAttr('name');

            var sqlStatement = sqlBuilder.buildSQLStatement();
            expect(sqlStatement.sqlString).to.equal('SELECT T1.NAME AS "T1.NAME" FROM USERS T1 WHERE T1.NAME = ? ORDER BY T1.NAME');
            expect(sqlStatement.bindings[0]).to.equal('test');

            query = apatite.newQuery(User);
            query.setSession(session);
            query.attr('name').eq('test').orderBy('name').desc();
            sqlBuilder = apatite.dialect.getSelectSQLBuilder(query);
            query.fetchAttr('name');

            sqlStatement = sqlBuilder.buildSQLStatement();
            expect(sqlStatement.sqlString).to.equal('SELECT T1.NAME AS "T1.NAME" FROM USERS T1 WHERE T1.NAME = ? ORDER BY T1.NAME DESC');
            expect(sqlStatement.bindings[0]).to.equal('test');
        });
    });

})