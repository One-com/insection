var Insection = require('../lib/Insection.js');
var expect = require('./unexpected-configured');
var Chance = require('chance');

describe("Insection", function () {
    var chance = new Chance(42);
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

        it('can be called as a function', function () {
            /* jshint newcap:false */
            expect(Insection(), 'to be an', 'Insection');
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
            expect([
                ['$', 3, 5, ']'],
                ['(', 3, 5, '$'],
                ['(', 3, '$'],
                [5, -3454],
                [5, 4],
                ["b", "a"],
                [4, "a"],
                [Infinity, -Infinity],
                [0, Infinity],
                ['(', 0, Infinity, ']'],
                ['[', -Infinity, 0, ')']
            ], 'to be an array whose items satisfy', function (args) {
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

        it("overrides duplicate entries", function () {
            insection.add(3, 4, 'foo');
            insection.add(3, 4, 'foo');
            expect(insection.get(), 'to have length', 1);
        });

        it("does not consider duplicate intervals with distinct value duplicate", function () {
            insection.add(3, 4, 'foo');
            insection.add(3, 4, 'bar');
            expect(insection.get(), 'to have length', 2);
        });
    });

    describe('contains', function () {
        var entries = [
            Insection.interval('(', -Infinity, 5, ']'),
            Insection.interval(-3454, 5),
            Insection.interval('[', 0, 4, ')'),
            Insection.interval(2, 3),
            Insection.interval(4, 4),
            Insection.interval(4, 5),
            Insection.interval(6, 8),
            Insection.interval('(', 5, 35, ')'),
            Insection.interval('[', 4000, Infinity, ')')
        ].map(function (interval, index) {
            return { interval: interval, value: index };
        });

        beforeEach(function () {
            entries.forEach(function (entry) {
                insection.add(entry.interval, entry.value);
            });
        });

        it("contains(4) is an alias for contains(Insection.interval('[',4,4,']'))", function () {
            expect(insection.contains(4, 4), 'to be true');
        });

        it("contains(4,5) is an alias for contains(Insection.interval('[',4,5,']'))", function () {
            expect(insection.contains(4, 4), 'to be true');
        });

        it('returns true if the insection contains the given interval', function () {
            entries.forEach(function (entry) {
                expect(insection, 'to contain', entry.interval);
            });
        });

        it('returns false if the insection contains the given interval', function () {
            [
                Insection.interval('(', -Infinity, 5, ')'),
                Insection.interval(-3454, 6),
                Insection.interval('[', 0, 4, ']'),
                Insection.interval(2, 2),
                Insection.interval(2, 10),
                Insection.interval(1000, 1010),
                Insection.interval('[', 5, 35, ']'),
                Insection.interval('(', 4000, Infinity, ')')
            ].forEach(function (interval) {
                expect(insection, 'not to contain', interval);
            });
        });

        it('returns false if the insection is empty', function () {
            expect(new Insection().contains(1, 3), 'to be false');
        });

        it('returns false if the hieracical data on the root of the tree does not contain the given interval', function () {
            expect(new Insection().add(5, 10, 'foo').contains(1, 3), 'to be false');
        });
    });

    describe('remove', function () {
        var entries = [
            Insection.interval('(', -Infinity, 5, ']'),
            Insection.interval(-3454, 5),
            Insection.interval('[', 0, 4, ')'),
            Insection.interval(2, 3),
            Insection.interval(4, 4),
            Insection.interval(4, 5),
            Insection.interval(6, 8),
            Insection.interval(4, 3345),
            Insection.interval('(', 5, 35, ')'),
            Insection.interval('[', 4, Infinity, ')')
        ].map(function (interval, index) {
            return { interval: interval, value: index };
        });

        beforeEach(function () {
            entries.forEach(function (entry) {
                insection.add(entry.interval, entry.value);
            });
        });

        it("remove(3,'foo') is an alias for remove(Insection.interval('[',3,3,']'),'foo')", function () {
            insection.add(3, 3, 'foo');
            insection.remove(3, 3, 'foo');
            expect(insection, 'not to contain', Insection.interval('[', 3, 3, ']'));
        });

        it("remove(3,4,'foo') is an alias for remove(Insection.interval('[',3,4,']'),'foo')", function () {
            insection.add(3, 4, 'foo');
            insection.remove(3, 4, 'foo');
            expect(insection, 'not to contain', Insection.interval('[', 3, 4, ']'));
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
            it("remove(" + ["'" + startString + "'", start, end, "'" + endString + "'"].join(",") + ",'foo') is an alias for remove(" + interval.toString(true) + ",'foo')", function () {
                insection.add(interval, 'foo');
                insection.remove(startString, start, end, endString, 'foo');
                expect(insection, 'not to contain', interval);
            });
        });

        entries.forEach(function (entry) {
            var interval = entry.interval;
            var value = entry.value;
            it("remove(" + interval.toString(true) + ",'" + value + "') removes the interval " + interval + " => '" + value, function () {
                expect(insection.remove(interval, value), 'to be an', 'Insection');
                expect(insection, 'not to contain', interval);
            });
        });

        it('remove on a empty insection does nothing', function () {
            var insection = new Insection();
            expect(insection.remove(2, 3, 'foo'), 'to be an', 'Insection');
            expect(insection, 'to be empty');
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

        it("get() returns all values in the data structure", function () {
            expect(insection.get(), 'to equal', insection.get(Insection.interval('(', -Infinity, Infinity, ')')));
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

        it('returns an empty list if the insection is empty', function () {
            expect(new Insection().get('(', -Infinity, Infinity, ')'), 'to be empty');
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
                Insection.interval(4, 5),
                Insection.interval(6, 8),
                Insection.interval(4, 3345),
                Insection.interval('(', 5, 35, ')'),
                Insection.interval('[', 4, Infinity, ')')
            ];
            intervals.forEach(function (interval, index) {
                insection.add(interval, chance.natural());
            });
        });

        it("getIntervals() returns all values in the data structure", function () {
            expect(insection.getIntervals(), 'to equal', insection.getIntervals(Insection.interval('(', -Infinity, Infinity, ')')));
        });

        it("getIntervals(3) is an alias for getIntervals(Insection.interval('[',3,3,']'))", function () {
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

        it("getEntries() returns all values in the data structure", function () {
            expect(insection.getEntries(), 'to equal', insection.getEntries(Insection.interval('(', -Infinity, Infinity, ')')));
        });

        it("getEntries(3) is an alias for getEntries(Insection.interval('[',3,3,']'))", function () {
            expect(insection.getEntries(3), 'to equal', insection.getEntries(Insection.interval('[', 3, 3, ']')));
        });

        it("getEntries(3,4) is an alias for getEntries(Insection.interval('[',3,4,']'))", function () {
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
            it("getEntries(" + ["'" + startString + "'", start, end, "'" + endString + "'"].join(",") + ") is an alias for getEntries(" + interval.toString(true) + ",'foo')", function () {
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

    describe('getGaps', function () {
        var intervals;
        beforeEach(function () {
            intervals = [
                Insection.interval('(', -Infinity, -900, ']'),
                Insection.interval(-20, -10),
                Insection.interval('(', 0, 4, ')'),
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

        it("getGaps(3) is an alias for getGaps(Insection.interval('[',3,3,']'))", function () {
            expect(insection.getGaps(3), 'to equal', []);
        });

        it("getGaps(3,4) is an alias for getGaps(Insection.interval('[',3,4,']'))", function () {
            expect(insection.getGaps(3, 4), 'to equal', insection.getGaps(Insection.interval('[', 3, 4, ']')));
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
            it("getGaps(" + ["'" + startString + "'", start, end, "'" + endString + "'"].join(",") + ") is an alias for getGaps(" + interval.toString(true) + ",'foo')", function () {
                expect(insection.getGaps(startString, start, end, endString), 'to equal', insection.getGaps(Insection.interval(startString, start, end, endString)));
            });
        });

        it('returns the gaps that are not covered by any intervals in the insection between the endpoint of the given interval', function () {
            expect(insection.getGaps(-1000, 1000).map(function (interval) {
                return interval.toString();
            }).sort(), 'to equal', [
                '(-10;0]',
                '(-900;-20)'
            ]);
        });

        it('gaps does not intersect with any of the intervals in the insection structure', function () {
            var queryInterval = Insection.interval('(', -Infinity, Infinity, ')');
            expect(insection, 'to only contain valid gaps for interval', queryInterval);
        });

        it('returns the entire interval if the given interval does not overlap with any intervals', function () {
            var insection = new Insection();
            expect(insection.getGaps(0, 10), 'to equal', [Insection.interval(0, 10)]);
        });

        it('returns an empty array if the insection contains no gaps for the given interval', function () {
            var insection = new Insection();
            insection.add(0, 3, '0');
            insection.add(3, 6, '1');
            insection.add(6, 9, '2');
            expect(insection.getGaps(0, 9), 'to be empty');
        });

        it('success the readme example', function () {
            var insection = new Insection();
            insection.add(0, 2, '0');
            insection.add(3, 6, '1');
            insection.add('[', 5, 7, ')', '2');
            insection.add('(', 7, 8, ']', '3');
            insection.add(9, 10, '4');

            expect(insection, 'when getting gaps between', '[0;10]',
                   'to equal',
                   ['(2;3)', '(8;9)', '[7;7]']);
        });

        it('find gaps between negative intervals', function () {
            var insection = new Insection();
            insection.add(-1, 'a');
            insection.add(-10, -8, 'b');

            expect(insection, 'when getting gaps between', '[-11;2]',
                   'to equal',
                   ['(-1;2]', '(-8;-1)', '[-11;-10)']);
        });
    });
});
