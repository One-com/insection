var Insection = require('../lib/Insection');
var expect = require('./unexpected-configured');

describe('Interval', function () {
    describe('intersect', function () {
        [
            [Insection.interval('(', -Infinity, 5, ']'), Insection.interval('[', 5, Infinity, ')')],
            [Insection.interval(-3454, 5), Insection.interval(-34, 2)],
            [Insection.interval(-3454, -34), Insection.interval(-34, 2)],
            [Insection.interval('[', 0, 4, ')'), Insection.interval(-10, 10)],
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
});
