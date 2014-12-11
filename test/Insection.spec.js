/*global describe, it, beforeEach*/
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


describe("Insection", function () {
    var insection;
    beforeEach(function () {
        insection = new Insection();
    });

    describe("constructor", function () {
        it("returns an instance of insection", function () {
            expect(insection, 'to be an', 'Insection');
        });

        it("is empty before any intervals has been added", function () {
            expect(insection, 'to be empty');
        });
    });

    describe("interval", function () {
        it("Insection.interval(3) is an alias for Insection.interval('[',3,3,']')", function () {
            expect(Insection.interval(3), 'to equal', Insection.interval('[', 3, 3, ']'));
        });

        it("Insection.interval(3,4) is an alias for Insection.interval('[',3,4,']')", function () {
            expect(Insection.interval(3, 4), 'to equal', Insection.interval('[', 3, 4, ']'));
        });

        [
            { interval: Insection.interval('(', -Infinity, 5, ']'), toString: '(-Infinity;5]' },
            { interval: Insection.interval(-3454, 5), toString: '[-3454;5]' },
            { interval: Insection.interval(4, 5), toString: '[4;5]' },
            { interval: Insection.interval(4, 3345), toString: '[4;3345]' },
            { interval: Insection.interval(4, 4), toString: '[4;4]' },
            { interval: Insection.interval("a", "b"), toString: '[a;b]' },
            { interval: Insection.interval('[', 4, 4, ')'), toString: '[4;4)' },
            { interval: Insection.interval('[', 4, Infinity, ')'), toString: '[4;Infinity)' },
            { interval: Insection.interval('(', -Infinity, Infinity, ')'), toString: '(-Infinity;Infinity)' }
        ].forEach(function (example) {
            it(example.interval.toString(true) + " returns the interval " + example.toString, function () {
                expect(example.interval.toString(), 'to equal', example.toString);
            });
        });

        it('fails if the interval arguments are invalid', function () {
            [
                ['$', 3, 5, ']'],
                ['(', 3, 5, '$'],
                ['(', 3, '$'],
                [5, -3454],
                [5, 4],
                ["b", "a"],
                [4, "a"],
                [Infinity, -Infinity],
                [0, Infinity],
                [-Infinity, 0]
            ].forEach(function (args) {
                expect(function () {
                    Insection.interval.apply(null, args);
                }, 'to throw', /valid signatures are/);
            });
        });
    });

    describe("add", function () {
        it("add(3,'foo') is an alias for add(Insection.interval('[',3,3,']'),'foo')", function () {
            insection.add(3, 3, 'foo');
            expect(insection, 'to contain', Insection.interval('[', 3, 3, ']'));
        });

        it("add(3,4,'foo') is an alias for add(Insection.interval('[',3,4,']'),'foo')", function () {
            insection.add(3, 4, 'foo');
            expect(insection, 'to contain', Insection.interval('[', 3, 4, ']'));
        });

        [
            Insection.interval('[', 3, 4, ']'),
            Insection.interval('[', 3, 4, ')'),
            Insection.interval('(', 3, 4, ']'),
            Insection.interval('(', 3, 4, ')')
        ].forEach(function (interval) {
            var startString = interval.startString;
            var start = interval.start;
            var end = interval.end;
            var endString = interval.endString;
            it("add(" + ["'" + startString + "'", start, end, "'" + endString + "'"].join(",") + ",'foo') is an alias for add(" + interval.toString(true) + ",'foo')", function () {
                insection.add(startString, start, end, endString, 'foo');
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
            it("add(" + interval.toString(true) + ",'foo') adds the value 'foo' for the interval "  + interval, function () {
                expect(insection.add(interval, 'foo'), 'to be an', 'Insection');
                expect(insection, 'not to be empty');
                expect(insection, 'to contain', interval);
            });
        });
    });

    describe('get', function () {
        var intervals;
        beforeEach(function () {
            intervals = [
                Insection.interval('(', -Infinity, 5, ']'),
                Insection.interval(-3454, 5),
                Insection.interval('[', 0, 4, ')'),
                Insection.interval(2, 3),
                Insection.interval(4, 5),
                Insection.interval(6, 8),
                Insection.interval(4, 3345),
                Insection.interval('(', 5, 35, ')'),
                Insection.interval('[', 4, Infinity, ')')
            ];
            intervals.forEach(function (interval, index) {
                insection.add(interval, interval.toString());
            });
        });

        it("get(3) is an alias for get(Insection.interval('[',3,3,']'))", function () {
            expect(insection.get(3), 'to equal', insection.get(Insection.interval('[', 3, 3, ']')));
        });

        it("get(3,4,'foo') is an alias for get(Insection.interval('[',3,4,']'),'foo')", function () {
            expect(insection.get(3, 4), 'to equal', insection.get(Insection.interval('[', 3, 4, ']')));
        });

        [
            Insection.interval('[', 3, 4, ']'),
            Insection.interval('[', 3, 4, ')'),
            Insection.interval('(', 3, 4, ']'),
            Insection.interval('(', 3, 4, ')')
        ].forEach(function (interval) {
            var startString = interval.startString;
            var start = interval.start;
            var end = interval.end;
            var endString = interval.endString;
            it("get(" + ["'" + startString + "'", start, end, "'" + endString + "'"].join(",") + ",'foo') is an alias for get(" + interval.toString(true) + ",'foo')", function () {
                expect(insection.get(startString, start, end, endString), 'to equal', insection.get(Insection.interval(startString, start, end, endString)));
            });
        });

        it('returns the values of all intervals that intersects the given interval', function () {
            expect(insection.get(4, 5).sort(), 'to equal', [
                '(-Infinity;5]',
                '[-3454;5]',
                '[4;3345]',
                '[4;5]',
                '[4;Infinity)'
            ]);
        });
    });

    describe('getIntervals', function () {
        var intervals;
        beforeEach(function () {
            intervals = [
                Insection.interval('(', -Infinity, 5, ']'),
                Insection.interval(-3454, 5),
                Insection.interval('[', 0, 4, ')'),
                Insection.interval(2, 3),
                Insection.interval(4, 5),
                Insection.interval(6, 8),
                Insection.interval(4, 3345),
                Insection.interval('(', 5, 35, ')'),
                Insection.interval('[', 4, Infinity, ')')
            ];
            intervals.forEach(function (interval, index) {
                insection.add(interval, 'value');
            });
        });

        it("getInterval(3) is an alias for getIntervals(Insection.interval('[',3,3,']'))", function () {
            expect(insection.getIntervals(3), 'to equal', insection.getIntervals(Insection.interval('[', 3, 3, ']')));
        });

        it("getIntervals(3,4,'foo') is an alias for getIntervals(Insection.interval('[',3,4,']'),'foo')", function () {
            expect(insection.getIntervals(3, 4), 'to equal', insection.getIntervals(Insection.interval('[', 3, 4, ']')));
        });

        [
            Insection.interval('[', 3, 4, ']'),
            Insection.interval('[', 3, 4, ')'),
            Insection.interval('(', 3, 4, ']'),
            Insection.interval('(', 3, 4, ')')
        ].forEach(function (interval) {
            var startString = interval.startString;
            var start = interval.start;
            var end = interval.end;
            var endString = interval.endString;
            it("getIntervals(" + ["'" + startString + "'", start, end, "'" + endString + "'"].join(",") + ",'foo') is an alias for getIntervals(" + interval.toString(true) + ",'foo')", function () {
                expect(insection.getIntervals(startString, start, end, endString), 'to equal', insection.getIntervals(Insection.interval(startString, start, end, endString)));
            });
        });

        it('returns the values of all intervals that intersects the given interval', function () {
            expect(insection.getIntervals(4, 5).map(function (interval) {
                return interval.toString();
            }).sort(), 'to equal', [
                '(-Infinity;5]',
                '[-3454;5]',
                '[4;3345]',
                '[4;5]',
                '[4;Infinity)'
            ]);
        });
    });

    describe('getEntries', function () {
        var intervals;
        beforeEach(function () {
            intervals = [
                Insection.interval('(', -Infinity, 5, ']'),
                Insection.interval(-3454, 5),
                Insection.interval('[', 0, 4, ')'),
                Insection.interval(2, 3),
                Insection.interval(4, 5),
                Insection.interval(6, 8),
                Insection.interval(4, 3345),
                Insection.interval('(', 5, 35, ')'),
                Insection.interval('[', 4, Infinity, ')')
            ];
            intervals.forEach(function (interval, index) {
                insection.add(interval, interval.toString());
            });
        });

        it("getEntries(3) is an alias for getEntries(Insection.interval('[',3,3,']'))", function () {
            expect(insection.getEntries(3), 'to equal', insection.getEntries(Insection.interval('[', 3, 3, ']')));
        });

        it("getEntries(3,4,'foo') is an alias for getEntries(Insection.interval('[',3,4,']'),'foo')", function () {
            expect(insection.getEntries(3, 4), 'to equal', insection.getEntries(Insection.interval('[', 3, 4, ']')));
        });

        [
            Insection.interval('[', 3, 4, ']'),
            Insection.interval('[', 3, 4, ')'),
            Insection.interval('(', 3, 4, ']'),
            Insection.interval('(', 3, 4, ')')
        ].forEach(function (interval) {
            var startString = interval.startString;
            var start = interval.start;
            var end = interval.end;
            var endString = interval.endString;
            it("getEntries(" + ["'" + startString + "'", start, end, "'" + endString + "'"].join(",") + ",'foo') is an alias for getEntries(" + interval.toString(true) + ",'foo')", function () {
                expect(insection.getEntries(startString, start, end, endString), 'to equal', insection.getEntries(Insection.interval(startString, start, end, endString)));
            });
        });

        it('returns the values of all intervals that intersects the given interval', function () {
            expect(insection.getEntries(4, 5).map(function (entries) {
                return entries.interval.toString() + ' => ' + entries.value;
            }).sort(), 'to equal', [
                '(-Infinity;5] => (-Infinity;5]',
                '[-3454;5] => [-3454;5]',
                '[4;3345] => [4;3345]',
                '[4;5] => [4;5]',
                '[4;Infinity) => [4;Infinity)'
            ]);
        });
    });
});
