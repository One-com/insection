var insection = require('../lib/Insection.js');
var expect = require('unexpected').clone()
    .addType({
        name: 'insection',
        identify: function (value) {
            return value instanceof insection;
        },
        inspect: function (interval, depth, output) {
            return output.text('[').text(interval.start).sp().text(interval.end).text('] : ').text(interval.value);
        }
    })
    .addAssertion('insection', '[not] to be empty', function (expect, subject) {
        expect(subject.isEmpty(), '[not] to be true');
    });

describe('insection', function () {
    var intervals;

    describe('called with no arguments', function () {
        beforeEach(function () {
            intervals = insection();
        });

        it('returns an instance of insection', function () {
            expect(intervals, 'to be an', 'insection');
        });

        it('is empty before any intervals has been added', function () {
            expect(intervals, 'to be empty');
        });
    });
});
