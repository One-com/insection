var InvalidIntervalError = require('./InvalidIntervalError');
var Interval = require('./Interval');
var RedBlackTree = require('./RedBlackTree');

function augmenter(value, x, y) {
    var interval = value.interval;
    if (!x && !y) { return interval; }

    var minStart = interval;
    var maxEnd = interval;

    if (x && (x.start < minStart.start || (x.start === minStart.start && minStart.isStartOpen()))) {
        minStart = x;
    }

    // y.start can't be less that value.start as we sort on start

    if (x && (x.end > maxEnd.end || (x.end === maxEnd.end && maxEnd.isEndOpen()))) {
        maxEnd = x;
    }

    if (y && (y.end > maxEnd.end || (y.end === maxEnd.end && maxEnd.isEndOpen()))) {
        maxEnd = y;
    }

    return Interval.create(
        minStart.startString,
        minStart.start,
        maxEnd.end,
        maxEnd.endString
    );
}

function defaultValueComparer(x, y) {
    if (x < y) { return -1; }
    if (x > y) { return 1; }
    return 0;
}

function intervalComparer(x, y) {
    if (x.start < y.start) { return -1; }
    if (x.start > y.start) { return 1; }
    if (x.end < y.end) { return -1; }
    if (x.end > y.end) { return 1; }
    if (!x.isStartOpen() && y.isStartOpen()) { return -1; }
    if (x.isStartOpen() && !y.isStartOpen()) { return 1; }
    if (!x.isEndOpen() && y.isEndOpen()) { return -1; }
    if (x.isEndOpen() && !y.isEndOpen()) { return 1; }
    return 0;
}

function Insection(valueComparer) {
    if (!(this instanceof Insection)) {
        return new Insection();
    }
    valueComparer = valueComparer || defaultValueComparer;

    this.data = new RedBlackTree(function (x, y) {
        var c = intervalComparer(x.interval, y.interval);
        if (c !== 0) { return c; }
        return valueComparer(x.value, y.value);
    }, augmenter);
}

Insection.interval = function (startString, start, end, endString) {
    if (arguments.length === 1) {
        if (arguments[0] instanceof Interval) {
            return arguments[0];
        }

        return Insection.interval('[', arguments[0], arguments[0], ']');
    }

    if (arguments.length === 2) {
        return Insection.interval('[', arguments[0], arguments[1], ']');
    }

    var startType = typeof start;
    var endType = typeof end;
    if (
        arguments.length !== 4 ||
            start > end ||
            startType !== endType ||
            !(startType === 'number' || startType === 'string')
    ) {
        throw new InvalidIntervalError(arguments);
    }

    return Interval.create(startString, start, end, endString);
};

Insection.prototype.interval = function () {
    return Insection.interval.apply(null, arguments);
};


Insection.prototype.isEmpty = function () {
    return this.data.isEmpty();
};

Insection.prototype.add = function () {
    var data = this.data;
    var intervalArgs = Array.prototype.slice.call(arguments, 0, -1);
    var interval = Insection.interval.apply(null, intervalArgs);
    var value = arguments[arguments.length - 1];

    data.add({ interval: interval, value: value });
    return this;
};

Insection.prototype.remove = function () {
    var data = this.data;
    var intervalArgs = Array.prototype.slice.call(arguments, 0, -1);
    var interval = Insection.interval.apply(null, intervalArgs);
    var value = arguments[arguments.length - 1];

    data.remove({ interval: interval, value: value });
    return this;
};

Insection.prototype.contains = function () {
    var interval = Insection.interval.apply(null, arguments);
    if (this.data.isEmpty()) {
        return false;
    }

    if (!interval.intersect(this.data.root.hierarchicalData)) {
        return false;
    }

    return this.data.find(function (value) {
        return intervalComparer(interval, value.interval);
    }) !== null;
};

Insection.prototype.getEntries = function () {
    var interval = arguments.length === 0 ?
        { intersect: function () { return true; } } :
        Insection.interval.apply(null, arguments);

    var root = this.data.root;
    if (!root) {
        return [];
    }

    var result = [];
    var queue = [this.data.root];

    while (queue.length) {
        var node = queue.pop();

        if (interval.intersect(node.value.interval)) {
            result.push(node.value);
        }

        var left = node.left;
        if (left && interval.intersect(left.hierarchicalData)) {
            queue.push(left);
        }

        var right = node.right;
        if (right && interval.intersect(right.hierarchicalData)) {
            queue.push(right);
        }
    }

    return result;
};

Insection.prototype.get = function () {
    return this.getEntries.apply(this, arguments).map(function (entry) {
        return entry.value;
    });
};

Insection.prototype.getIntervals = function () {
    return this.getEntries.apply(this, arguments).map(function (entry) {
        return entry.interval;
    });
};

module.exports = Insection;
