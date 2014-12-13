var InvalidIntervalError = require('./InvalidIntervalError');

function isInfinite(value) {
    return value === Infinity || value === -Infinity;
}

function Interval(start, end) {
    this.start = start;
    this.end = end;
}

Interval.create = function (startString, start, end, endString) {
    switch (startString + endString) {
    case '[]':
        if (isInfinite(start) || isInfinite(end)) {
            throw new InvalidIntervalError(arguments);
        }
        return new ClosedClosedInterval(start, end);
    case '[)':
        if (isInfinite(start)) { throw new InvalidIntervalError(arguments); }
        return new ClosedOpenInterval(start, end);
    case '(]':
        if (isInfinite(end)) { throw new InvalidIntervalError(arguments); }
        return new OpenClosedInterval(start, end);
    case '()': return new OpenOpenInterval(start, end);
    default: throw new InvalidIntervalError(arguments);
    }
};

Interval.prototype.toString = function (detailed) {
    return detailed ? "Insection.interval('" + this.startString + "'," + this.start + "," + this.end + ",'" + this.endString + "')" :
        this.startString + this.start + ";" + this.end + this.endString;
};

Interval.prototype.intersect = function (other) {
    return !(
        // other interval starts after this interval ends
        this.end < other.start ||
            // this interval starts after other interval ends
            this.start > other.end ||
            // this interfval and the other interval share start and end but one of the interval ends are open
            (this.end === other.start && (this.isEndOpen() || other.isStartOpen())) ||
            (this.start === other.end && (this.isStartOpen() || other.isEndOpen()))
    );
};

function OpenOpenInterval(start, end) {
    Interval.call(this, start, end);
    this.startString = '(';
    this.endString = ')';
}
OpenOpenInterval.prototype = Object.create(Interval.prototype);
OpenOpenInterval.prototype.isStartOpen = function () { return true; };
OpenOpenInterval.prototype.isEndOpen = function () { return true; };

function OpenClosedInterval(start, end) {
    Interval.call(this, start, end);
    this.startString = '(';
    this.endString = ']';
}
OpenClosedInterval.prototype = Object.create(Interval.prototype);
OpenClosedInterval.prototype.isStartOpen = function () { return true; };
OpenClosedInterval.prototype.isEndOpen = function () { return false; };

function ClosedOpenInterval(start, end) {
    Interval.call(this, start, end);
    this.startString = '[';
    this.endString = ')';
}
ClosedOpenInterval.prototype = Object.create(Interval.prototype);
ClosedOpenInterval.prototype.isStartOpen = function () { return false; };
ClosedOpenInterval.prototype.isEndOpen = function () { return true; };

function ClosedClosedInterval(start, end) {
    Interval.call(this, start, end);
    this.startString = '[';
    this.endString = ']';
}
ClosedClosedInterval.prototype = Object.create(Interval.prototype);
ClosedClosedInterval.prototype.isStartOpen = function () { return false; };
ClosedClosedInterval.prototype.isEndOpen = function () { return false; };
module.exports = Interval;
