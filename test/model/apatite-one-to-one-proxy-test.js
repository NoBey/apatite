'use strict';

var should = require('chai').should();
var expect = require('chai').expect;

var ApatiteTestUtil = require('../apatite-test-util.js');
var util = new ApatiteTestUtil();

describe('ApatiteOneToOneProxyTest', function () {
    it('One To One Proxy Validity', function () {
        util.newSession(function (err, session) {
            var query = util.newQueryForEmployee(session);
            session.execute(query, function (err, employees) {
                var employee = employees[0];
                expect(employee.department).to.not.equal(null);
                var changesToDo = function (changesDone) {
                    employee.department = null;
                    changesDone('some error so rollback occurs and depart is not null again');
                };

                var onSaved = function (err) {
                    expect(employee.department).to.not.equal(null);
                };

                session.doChangesAndSave(changesToDo, onSaved);
                expect(employee.department.valueFetched).to.equal(false);
                employee.department.getValue(function (err, dept) {
                    expect(employee.department.valueFetched).to.equal(true);
                    var changesToDo = function (changesDone) {
                        employee.department = null;
                        changesDone('some error so rollback occurs and depart is not null again');
                    };

                    var onSaved = function (err) {
                        expect(employee.department).to.not.equal(null);
                        expect(employee.department.valueFetched).to.equal(true);
                    };
                    session.doChangesAndSave(changesToDo, onSaved);
                })
            });
        });

        util.newSession(function (err, session) {
            var query = util.newQueryForEmployee(session);
            session.execute(query, function (err, employees) {

                employees[2].department.getValue(function (err, dept) {
                    expect(err.message).to.equal('Select statement failed.');
                });

            });
        });


        util.newSession(function (err, session) {
            var query = util.newQueryForEmployee(session);
            session.execute(query, function (err, employees) {
                var department = employees[0].department;
                expect(department.toJSON()).to.equal('ApatiteOneToOneProxy: value not fetched yet.');
                employees[0].department.getValue(function (err, dept) {
                    expect(department.toJSON()).to.not.equal('ApatiteOneToOneProxy: value not fetched yet.');
                });
            });
        });
    });
})