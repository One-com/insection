var Insection = require('../lib/Insection.js');

module.exports = require('unexpected').clone()
    .addType({
        name: 'Insection',
        base: 'object',
        identify: function (value) {
            return value instanceof Insection;
        },
        inspect: function (insection, depth, output) {
            return output.text('Insection');
        }
    })
    .addType({
        name: 'Interval',
        base: 'object',
        identify: function (value) {
            return value &&
                typeof value === 'object' &&
                'start' in value && 'end' in value;
        },
        inspect: function (interval, depth, output) {
            output.text(interval.startString || '[')
                .text(interval.start)
                .text(';')
                .text(interval.end)
                .text(interval.endString || ']');
            return output;
        }
    })
    .addAssertion('Insection', '[not] to be empty', function (expect, subject) {
        expect(subject.isEmpty(), '[not] to be true');
    })
    .addAssertion('Insection', '[not] to contain', function (expect, subject, interval) {
        expect(subject.contains(interval), '[not] to be true');
    })
    .addAssertion('Interval', '[not] to intersect with', function (expect, subject, other) {
        expect(subject.intersect(other), '[not] to be true');
    });
