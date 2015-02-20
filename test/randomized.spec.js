/*global describe, it, beforeEach*/
var Insection = require('../lib/Insection.js');
var Chance = require('chance');
var expect = require('./unexpected-configured');

describe('@slow randomized tests', function () {
    var chance = new Chance(42);
    var insection;
    beforeEach(function () {
        insection = new Insection();
    });

    function Chunk(from, length) {
        this.from = from;
        this.to = from + length;
    }

    Chunk.prototype.toString = function () {
        return this.from + '-' + this.to;
    };

    Chunk.prototype.forEach = function (cb) {
        for (var i = this.from; i < this.to; i += 1) {
            cb(i);
        }
    };

    function Chunks(length, chunkSize) {
        this.chunkSize = chunkSize || 100;
        this.length = length;
    }

    Chunks.prototype.forEach = function (cb) {
        for (var i = 0; i < this.length; i += this.chunkSize) {
            cb(new Chunk(i, this.chunkSize));
        }
    };

    var numberOfIntervals = 10000;
    var numberOfIntervalsToFind = 1000;

    function findIntersectingIntervals(intervals, interval) {
        return intervals.filter(function (entry) {
            return interval.intersect(entry.interval);
        }).map(function (entry) {
            return entry.value;
        });
    }

    describe('with ' + numberOfIntervals + ' sparse floating number intervals', function () {
        var intervalLengths = [10, 100, 1000, 5000];
        function createInterval() {
            var start = chance.floating({min: -100000, max: 100000});
            var end = chance.floating({min: start, max: start + chance.pick(intervalLengths)});
            return Insection.interval(
                chance.bool({likelihood: 70}) ? '[' : '(',
                start,
                end,
                chance.bool({likelihood: 70}) ? ']' : ')'
            );
        }

        var entries;
        var insection;
        beforeEach(function () {
            entries = [];
            insection = new Insection();
            for (var i = 0; i < numberOfIntervals; i += 1) {
                var interval = createInterval();
                var value = chance.guid();
                entries.push({ interval: interval, value: value });
                insection.add(interval, value);
            }
        });

        it('the datastructure is balanced', function () {
            expect(insection, 'to be balanced');
        });

        describe('finds the same ' + numberOfIntervalsToFind + ' intervals as a simple algorithm', function () {
            new Chunks(numberOfIntervalsToFind).forEach(function (chunk) {
                it(chunk.toString(), function () {
                    chunk.forEach(function () {
                        var interval = createInterval();
                        expect(insection.get(interval).sort(), 'to equal', findIntersectingIntervals(entries, interval).sort());
                    });
                });
            });
        });

        describe('contains all the inserted intervals', function () {
            new Chunks(numberOfIntervals, 5000).forEach(function (chunk) {
                it(chunk.toString(), function () {
                    chunk.forEach(function (i) {
                        expect(insection, 'to contain', entries[i].interval);
                    });
                });
            });
        });

        describe('all intervals can be removed', function () {
            new Chunks(numberOfIntervals, 5000).forEach(function (chunk) {
                it(chunk.toString(), function () {
                    chunk.forEach(function (i) {
                        insection.remove(entries[i].interval, entries[i].value);
                        expect(insection, 'not to contain', entries[i].interval);
                    });
                });
            });
        });

        it('getGaps only returns intervals that does not intersect with any interval in the structure', function () {
            expect(insection, 'to only contain valid gaps for interval', Insection.interval('(', -Infinity, Infinity, ')'));
        });
    });

    describe('with ' + numberOfIntervals + ' floating number intervals', function () {
        var intervalLengths = [10, 100, 1000, 10000, Number.MAX_VALUE];
        var intervalStartingPoints = [{min: 0, max: 10000}, {min: -10000, max: 0}, {min: -10000, max: 10000}, {}];
        function createInterval() {
            var start = chance.floating(chance.pick(intervalStartingPoints));
            var end = chance.floating({min: start, max: Math.min(start + chance.pick(intervalLengths), 900719925474.0992)});
            return Insection.interval(
                chance.bool({likelihood: 70}) ? '[' : '(',
                start,
                end,
                chance.bool({likelihood: 70}) ? ']' : ')'
            );
        }

        var entries;
        var insection;
        beforeEach(function () {
            entries = [];
            insection = new Insection();
            for (var i = 0; i < numberOfIntervals; i += 1) {
                var interval = createInterval();
                var value = chance.guid();
                entries.push({ interval: interval, value: value });
                insection.add(interval, value);
            }
        });

        it('the datastructure is balanced', function () {
            expect(insection, 'to be balanced');
        });

        describe('finds the same ' + numberOfIntervalsToFind + ' intervals as a simple algorithm', function () {
            new Chunks(numberOfIntervalsToFind).forEach(function (chunk) {
                it(chunk.toString(), function () {
                    chunk.forEach(function () {
                        var interval = createInterval();
                        expect(insection.get(interval).sort(), 'to equal', findIntersectingIntervals(entries, interval).sort());
                    });
                });
            });
        });

        describe('contains all the inserted intervals', function () {
            new Chunks(numberOfIntervals, 5000).forEach(function (chunk) {
                it(chunk.toString(), function () {
                    chunk.forEach(function (i) {
                        expect(insection, 'to contain', entries[i].interval);
                    });
                });
            });
        });

        describe('all intervals can be removed', function () {
            new Chunks(numberOfIntervals, 5000).forEach(function (chunk) {
                it(chunk.toString(), function () {
                    chunk.forEach(function (i) {
                        insection.remove(entries[i].interval, entries[i].value);
                        expect(insection, 'not to contain', entries[i].interval);
                    });
                });
            });
        });

        it('getGaps only returns intervals that does not intersect with any interval in the structure', function () {
            expect(insection, 'to only contain valid gaps for interval', Insection.interval('(', -Infinity, Infinity, ')'));
        });
    });

    describe('with ' + numberOfIntervals + ' string intervals', function () {
        function createInterval() {
            var start = chance.string({length: 10});
            var end = String.fromCharCode(start.charCodeAt(0) + 5) + start.slice(1);
            return Insection.interval(
                chance.bool({likelihood: 70}) ? '[' : '(',
                start,
                end,
                chance.bool({likelihood: 70}) ? ']' : ')'
            );
        }

        var entries;
        var insection;
        beforeEach(function () {
            entries = [];
            insection = new Insection();
            for (var i = 0; i < numberOfIntervals; i += 1) {
                var interval = createInterval();
                var value = chance.guid();
                entries.push({ interval: interval, value: value });
                insection.add(interval, value);
            }
        });

        it('the datastructure is balanced', function () {
            expect(insection, 'to be balanced');
        });

        describe('finds the same ' + numberOfIntervalsToFind + ' intervals as a simple algorithm', function () {
            new Chunks(numberOfIntervalsToFind).forEach(function (chunk) {
                it(chunk.toString(), function () {
                    chunk.forEach(function () {
                        var interval = createInterval();
                        expect(insection.get(interval).sort(), 'to equal', findIntersectingIntervals(entries, interval).sort());
                    });
                });
            });
        });

        describe('contains all the inserted intervals', function () {
            new Chunks(numberOfIntervals, 5000).forEach(function (chunk) {
                it(chunk.toString(), function () {
                    chunk.forEach(function (i) {
                        expect(insection, 'to contain', entries[i].interval);
                    });
                });
            });
        });

        describe('all intervals can be removed', function () {
            new Chunks(numberOfIntervals, 5000).forEach(function (chunk) {
                it(chunk.toString(), function () {
                    chunk.forEach(function (i) {
                        insection.remove(entries[i].interval, entries[i].value);
                        expect(insection, 'not to contain', entries[i].interval);
                    });
                });
            });
        });

        it('getGaps only returns intervals that does not intersect with any interval in the structure', function () {
            expect(insection, 'to only contain valid gaps for interval', Insection.interval('a', 'z'));
        });
    });
});
