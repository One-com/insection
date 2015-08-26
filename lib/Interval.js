var InvalidIntervalError = require('./InvalidIntervalError');

function isFinite(value) {
    return value !== Infinity && value !== -Infinity;
}

function Interval(start, end) {
    this.start = start;
    this.end = end;
}

var intervalEndRequirements = {
    '[]': function (start, end) {
        return isFinite(start) && isFinite(end);
    },
    '(]': function (start, end) {
        return isFinite(end);
    },
    '[)': function (start, end) {
        return isFinite(start);
    },
    '()': function (start, end) {
        return true;
    }
};

function isValidIntervalEndpointType(type) {
    return type === 'number' || type === 'string';
}

function ensureValidInterval(startString, start, end, endString) {
    var startType = typeof start;
    var endType = typeof end;

    if (
        startType !== endType ||
        (startType !== 'number' && startType !== 'string') ||
        start > end
    ) {
        throw new InvalidIntervalError(startString, start, end, endString);
    }

    var intervalEndRequirement = intervalEndRequirements[startString + endString];
    if (!intervalEndRequirement || !intervalEndRequirement(start, end)) {
        throw new InvalidIntervalError(startString, start, end, endString);
    }
}

Interval.create = function (startString, start, end, endString) {
    ensureValidInterval(startString, start, end, endString);

    switch (startString + endString) {
    case '[]':
        return new ClosedClosedInterval(start, end);
    case '[)':
        return new ClosedOpenInterval(start, end);
    case '(]':
        return new OpenClosedInterval(start, end);
    case '()': return new OpenOpenInterval(start, end);
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

Interval.prototype.getIntersection = function (other) {
    var startPoint = this.start > other.start ? this : other;
    var endPoint = this.end < other.end ? this : other;

    if (this.start === other.start) {
        startPoint = this.isStartOpen() ? this : other;
    }

    if (this.end === other.end) {
        endPoint = this.isEndOpen() ? this : other;
    }

    return Interval.create(
        startPoint.isStartOpen() ? '(' : '[',
        startPoint.start,
        endPoint.end,
        endPoint.isEndOpen() ? ')' : ']'
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
