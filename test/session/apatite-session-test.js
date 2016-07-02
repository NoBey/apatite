'use strict';

var should = require('chai').should();
var expect = require('chai').expect;

var ApatiteTestUtil = require('../apatite-test-util.js');
var util = new ApatiteTestUtil();

describe('ApatiteSessionTest', function () {
    it('Session Validity', function () {
        util.newSession(function (err, session) {
            var changesToDo = function (changesDone) {
                //changesDone(); Not called intentionally so that the next call would give error
            };
            var onChangesSaved = function (err) {
            };
            session.doChangesAndSave(changesToDo, onChangesSaved);

            changesToDo = function (changesDone) {
                changesDone();
            };
            onChangesSaved = function (err) {
                expect(err.message).to.equal('Previous changes have not been saved. Probably the callback done() of changesToDo parameter of method doChangesAndSave(changesToDo, onChangesSaved) is not called.');
            };
            session.doChangesAndSave(changesToDo, onChangesSaved);

        });

        util.newSession(function (err, session) {
            var changesToDo = function (changesDone) {
                changesDone(new Error('Something went wrong while doing changes!'));
            };
            var onChangesSaved = function (err) {
                expect(err.message).to.equal('Something went wrong while doing changes!');
            };
            session.doChangesAndSave(changesToDo, onChangesSaved);
        });
    });
})