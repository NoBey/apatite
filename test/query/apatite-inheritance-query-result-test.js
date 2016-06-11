'use strict';

var should = require('chai').should();
var expect = require('chai').expect;

var ApatiteTestUtil = require('../apatite-test-util.js');
var util = new ApatiteTestUtil();

describe('ApatiteInheritanceQueryResultTest', function () {
    it('Inheritance Query Result Validity', function () {
        util.newSession(function (err, session) {

            var query = util.newQueryForShape(session);
            session.execute(query, function (err, allShapes) {
                expect(allShapes.length).to.equal(4);
                expect(allShapes[0].constructor.name).to.equal('Circle');
                expect(allShapes[1].constructor.name).to.equal('ShapeWithVertex');
                expect(allShapes[2].constructor.name).to.equal('ShapeWithVertex');
                expect(allShapes[3].constructor.name).to.equal('SemiCircle');
            });

            query = util.newQueryForCircle(session);
            session.execute(query, function (err, allCircles) {
                expect(allCircles.length).to.equal(1);
                expect(allCircles[0].constructor.name).to.equal('Circle');
            });

            query = util.newQueryForSemiCircle(session);
            session.execute(query, function (err, allSemiCircles) {
                expect(allSemiCircles.length).to.equal(1);
                expect(allSemiCircles[0].constructor.name).to.equal('SemiCircle');
            });

            query = util.newQueryForShapeWithVertex(session);
            session.execute(query, function (err, allShapesWithVertices) {
                expect(allShapesWithVertices.length).to.equal(2);
                expect(allShapesWithVertices[0].constructor.name).to.equal('ShapeWithVertex');
                expect(allShapesWithVertices[1].constructor.name).to.equal('ShapeWithVertex');
            });
        });
    });
})