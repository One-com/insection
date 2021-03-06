var Insection = require('../lib/Insection.js');
var Interval = require('../lib/Interval.js');

module.exports = require('unexpected').clone()
    .addType({
        name: 'Insection',
        base: 'object',
        identify: function (value) {
            return value instanceof Insection;
        },
        inspect: function (insection, depth, output, inspect) {
            var entries = insection.getEntries();
            var large = entries.length > 4;
            output.text('insection(');
            if (large) {
                output.nl();
                output.indentLines();
            } else {
                output.sp();
            }
            entries.sort(function (x, y) {
                var xInterval = x.interval;
                var yInterval = y.interval;
                if (xInterval.start < yInterval.start) { return -1; }
                if (xInterval.start > yInterval.start) { return 1; }
                if (xInterval.end < yInterval.end) { return -1; }
                if (xInterval.end > yInterval.end) { return 1; }
                if (!xInterval.isStartOpen() && yInterval.isStartOpen()) { return -1; }
                if (xInterval.isStartOpen() && !yInterval.isStartOpen()) { return 1; }
                if (!xInterval.isEndOpen() && yInterval.isEndOpen()) { return -1; }
                if (xInterval.isEndOpen() && !yInterval.isEndOpen()) { return 1; }
                return 0;
            }).forEach(function (entry, index) {
                if (index > 0) {
                    output.text(', ');
                    if (large) {
                        output.nl();
                    } else {
                        output.sp();
                    }
                }

                output.i().append(inspect(entry.interval))
                    .text(' => ')
                    .append(inspect(entry.value));
            });

            if (large) {
                output.nl();
                output.outdentLines();
            } else {
                output.sp();
            }
            output.text(')');
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
                .jsNumber(interval.start)
                .text(';')
                .jsNumber(interval.end)
                .text(interval.endString || ']');
            return output;
        }
    })
    .addAssertion('<Insection> [not] to be empty', function (expect, subject) {
        expect(subject.isEmpty(), '[not] to be true');
    })
    .addAssertion('<Insection> [not] to contain <Interval>', function (expect, subject, interval) {
        expect(subject.contains(interval), '[not] to be true');
    })
    .addAssertion('<Insection> not to have any interval intersecting with <Interval>', function (expect, subject, interval) {
        expect(subject.getIntervals(interval), 'to be empty');
    })
    .addAssertion('<Insection> to only contain valid gaps for interval <Interval>', function (expect, subject, interval) {
        this.errorMode = 'nested';
        var gaps = subject.getGaps(interval);
        gaps.forEach(function (gap) {
            expect(subject, 'not to have any interval intersecting with', gap);
        });
    })
    .addAssertion('<Interval> [not] to intersect with <Interval>', function (expect, subject, other) {
        expect(subject.intersect(other), '[not] to be true');
    })
    .addAssertion('<Insection> to be balanced', function (expect, subject) {
        var root = subject.data.root;

        // Root node should always be black
        expect(root.color, 'to be', 'black');

        // All nodes have a color
        (function assertHasColor(node) {
            if (node === null) { return; }
            expect(node.color, 'to match', /^red|black$/);
            assertHasColor(node.left);
            assertHasColor(node.right);
        })(root);

        // The children of a red node are black
        (function assertChildColor(node) {
            if (node === null) { return; }
            if (node.color === 'red') {
                if (node.left) { expect(node.left.color, 'to be', 'black'); }
                if (node.right) { expect(node.right.color, 'to be', 'black'); }
            }
            assertChildColor(node.left);
            assertChildColor(node.right);
        })(root);

        // All paths to leaf should have the same number of black nodes
        (function check(node, total, path) {
            if (node === null) {
                if (path === -1) { return total; }
                expect(path, 'to be', total);
                return path;
            }

            if (node.color === 'black') { total++; }

            path = check(node.left, total, path);
            path = check(node.right, total, path);

            return path;
        })(root, 0, -1);
    })
    .addAssertion('<Insection> when getting gaps between <string> <assertion>', function (expect, subject, interval) {
        var gaps = subject.getGaps(Interval.fromString(interval)).map(function (interval) {
            return interval.toString();
        }).sort();
        this.shift(gaps, 1);
    });
