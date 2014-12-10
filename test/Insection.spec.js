var Insection = require('../lib/Insection.js');
var expect = require('unexpected').clone()
    .addType({
        name: 'Insection',
        base: 'object',
        identify: function (value) {
            return value instanceof Insection;
        },
        inspect: function (interval, depth, output) {
            return output.text('Insection');
        }
    })
    .addAssertion('Insection', '[not] to be empty', function (expect, subject) {
        expect(subject.isEmpty(), '[not] to be true');
    })
    .addAssertion('Insection', '[not] to contain', function (expect, subject, interval) {
        expect(subject.contains(interval), '[not] to be true');
    });


describe('Insection', function () {
    var insection;
    beforeEach(function () {
        insection = new Insection();
    });

    describe('constructor', function () {
        it('returns an instance of insection', function () {
            expect(insection, 'to be an', 'Insection');
        });

        it('is empty before any intervals has been added', function () {
            expect(insection, 'to be empty');
        });
    });

    describe('interval', function () {
        it('Insection.interval(3,4) is an alias for Insection.interval("[",3,4,"]")', function () {
            expect(Insection.interval(3, 4), 'to equal', Insection.interval('[', 3, 4, ']'));
        });

        [
            { interval: Insection.interval('(', -Infinity, 5, ']'), toString: '(-Infinity,5]' },
            { interval: Insection.interval(-3454, 5), toString: '[-3454,5]' },
            { interval: Insection.interval(4, 5), toString: '[4,5]' },
            { interval: Insection.interval(4, 3345), toString: '[4,3345]' },
            { interval: Insection.interval('[', 4, Infinity, ')'), toString: '[4,Infinity)' },
            { interval: Insection.interval('(', -Infinity, Infinity, ')'), toString: '(-Infinity,Infinity)' }
        ].forEach(function (example) {
            it(example.interval.toString(true) + ' returns the interval ' + example.toString, function () {
                expect(example.interval.toString(), 'to equal', example.toString);
            });
        });
    });

    describe('add', function () {
        it('add(3,4) is an alias for add(Insection.interval("[",3,4,"]"))', function () {
            insection.add(3, 4);
            expect(insection, 'to contain', Insection.interval('[', 3, 4, ']'));
        });

        [
            Insection.interval("[", 3, 4, "]"),
            Insection.interval("[", 3, 4, ")"),
            Insection.interval("(", 3, 4, "]"),
            Insection.interval("(", 3, 4, ")")
        ].forEach(function (interval) {
            var startString = interval.startString;
            var start = interval.start;
            var end = interval.end;
            var endString = interval.endString;
            it('add(' + ['"' + startString + '"', start, end, '"' + endString + '"'].join(',') + ') is an alias for add(' + interval.toString(true) + ')', function () {
                insection.add(startString, start, end, endString);
                expect(insection, 'to contain', interval);
            });
        });

        [
            Insection.interval('(', -Infinity, 5, ']'),
            Insection.interval(-3454, 5),
            Insection.interval(4, 5),
            Insection.interval(4, 3345),
            Insection.interval('[', 4, Infinity, ')')
        ].forEach(function (interval) {
            it('add(' + interval.toString(true) + ') adds the ' + interval + ' interval to the interval collection', function () {
                expect(insection.add(interval), 'to be an', 'Insection');
                expect(insection, 'not to be empty');
                expect(insection, 'to contain', interval);
            });
        });
    });
});
