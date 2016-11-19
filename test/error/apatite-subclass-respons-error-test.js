'use strict';

var should = require('chai').should();
var expect = require('chai').expect;
var ApatiteDialect = require('../../lib/database/apatite-dialect.js');
var ApatiteConnection = require('../../lib/database/apatite-connection.js');
var ApatiteResultSet = require('../../lib/database/apatite-result-set.js');
var ApatiteExpression = require('../../lib/query-expression/apatite-expression.js');

describe('ApatiteSubClassResponsibilityTest', function() {
    it('Sub Class Responsibility Validity', function () {
        var dialect = new ApatiteDialect();
        var errMsg = 'My subclass should have overridden this method.';
        (function () {
            dialect.basicCreateConnectionPool();
        }).should.Throw(errMsg);
        (function () {
            dialect.newConnection();
        }).should.Throw(errMsg);
        (function () {
            dialect.getApatiteResultSet();
        }).should.Throw(errMsg);
        (function () {
            dialect.getApatiteResultSet();
        }).should.Throw(errMsg);

        var connection = new ApatiteConnection();
        (function () {
            connection.basicConnect();
        }).should.Throw(errMsg);
        (function () {
            connection.basicDisconnect();
        }).should.Throw(errMsg);
        (function () {
            connection.basicExecuteSQLString();
        }).should.Throw(errMsg);
        (function () {
            connection.basicBeginTransaction();
        }).should.Throw(errMsg);
        (function () {
            connection.basicCommitTransaction();
        }).should.Throw(errMsg);
        (function () {
            connection.basicRollbackTransaction();
        }).should.Throw(errMsg);

        var resultSet = new ApatiteResultSet();
        (function () {
            resultSet.fetchAllRows();
        }).should.Throw(errMsg);
        (function () {
            resultSet.fetchNextRows();
        }).should.Throw(errMsg);
        (function () {
            resultSet.closeResultSet();
        }).should.Throw(errMsg);

        var expr = new ApatiteExpression();
        (function () {
            expr.matchesRow();
        }).should.Throw(errMsg);
        (function () {
            expr.matchesObject();
        }).should.Throw(errMsg);
        (function () {
            expr.getAttributeNames();
        }).should.Throw(errMsg);
        (function () {
            expr.getAttrNamesWithValues();
        }).should.Throw(errMsg);
        expect(expr.isAttributeExpression()).to.equal(false);

    })
})