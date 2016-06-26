'use strict';

var should = require('chai').should();
var expect = require('chai').expect;

var ApatiteTestUtil = require('../apatite-test-util.js');
var util = new ApatiteTestUtil();

describe('ApatiteOneToManyProxyTest', function () {
    it('One To Many Proxy Validity', function () {
        util.newSession(function (err, session) {
            var query = util.newQueryForDepartment(session);
            session.execute(query, function (err, departments) {

                departments[0].employees.getValue(function (err, employees) {
                    expect(employees.length).to.equal(2);
                });
                departments[0].employees.getLength(function (err, numberOfEmps) {
                    expect(numberOfEmps).to.equal(2);
                });
                departments[0].employees.getAtIndex(1, function (err, employee) {
                    expect(employee.name).to.equal('Scot');
                    departments[0].employees.indexOf(employee, function (err, empIdx) {
                        expect(empIdx).to.equal(1);
                    });
                });
                departments[0].employees.remove(function (err) {
                    expect(err.message).to.equal('Object not found in apatite Array.');
                }, util.newDepartment());

                session.startTrackingChanges();
                departments[0].employees.removeAll(function (err) {
                    expect(err).to.equal(null);
                });
            });
        });
    });
})