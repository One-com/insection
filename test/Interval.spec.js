var Insection = require('../lib/Insection');
var Interval = require('../lib/Interval');
var expect = require('./unexpected-configured');

describe('Interval', function () {
    describe('intersect', function () {
        [
            [Insection.interval('(', -Infinity, 5, ']'), Insection.interval('[', 5, Infinity, ')')],
            [Insection.interval(-3454, 5), Insection.interval(-34, 2)],
            [Insection.interval(-3454, -34), Insection.interval(-34, 2)],
            [Insection.interval('[', 0, 4, ')'), Insection.interval(-10, 10)],
            [Insection.interval('[', 0, 4, ')'), Insection.interval(0)],
            [Insection.interval(2, 3), Insection.interval(-10, 2)],
            [Insection.interval('(', 42, 42, ')'), Insection.interval(41, 43)],
            [Insection.interval('[', 42, 42, ')'), Insection.interval(41, 43)],
            [Insection.interval('(', 42, 42, ']'), Insection.interval(41, 43)]
        ].forEach(function (example) {
            it(example[0] + ' intersect with ' + example[1], function () {
                expect(example[0], 'to intersect with', example[1]);
            });
        });

        [
            [Insection.interval('(', -Infinity, 5, ')'), Insection.interval('(', 5, Infinity, ')')],
            [Insection.interval('(', -Infinity, 5, ']'), Insection.interval('(', 5, Infinity, ')')],
            [Insection.interval('(', -Infinity, 5, ')'), Insection.interval('[', 5, Infinity, ')')],
            [Insection.interval(-10, -5), Insection.interval(5, 10)]
        ].forEach(function (example) {
            it(example[0] + ' does not intersect with ' + example[1], function () {
                expect(example[0], 'not to intersect with', example[1]);
            });
        });
    });

    describe('toString', function () {
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
            it('on ' + example.interval.toString(true) + " returns " + example.toString, function () {
                expect(example.interval.toString(), 'to equal', example.toString);
            });
        });
    });
    describe('fromString', function () {
        [
            { interval: Insection.interval('(', -Infinity, 5, ']'), text: '(-Infinity;5]' },
            { interval: Insection.interval(-3454, 5), text: '[-3454;5]' },
            { interval: Insection.interval(4, 5), text: '[4;5]' },
            { interval: Insection.interval(4, 3345), text: '[4;3345]' },
            { interval: Insection.interval(4, 4), text: '[4;4]' },
            { interval: Insection.interval("a", "b"), text: '[a;b]' },
            { interval: Insection.interval('[', 4, 4, ')'), text: '[4;4)' },
            { interval: Insection.interval('[', 4, Infinity, ')'), text: '[4;Infinity)' },
            { interval: Insection.interval('(', -Infinity, Infinity, ')'), text: '(-Infinity;Infinity)' }
        ].forEach(function (example) {
            it('on ' + example.text + " returns " + example.interval.toString(true), function () {
                expect(Interval.fromString(example.text), 'to equal', example.interval);
            });
        });

        it('fails when given a string that cannot be parsed as an interval', function () {
            expect(function () {
                Interval.fromString('foobar');
            }, 'to throw', 'Could not parse "foobar" as an interval');
        });
    });
});
