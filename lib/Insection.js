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
        return new Insection(valueComparer);
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

Insection.prototype.forEachEntry = function () {
    var intervalArgs = Array.prototype.slice.call(arguments, 0, -1);
    var callback = arguments[arguments.length - 1];
    var interval = intervalArgs.length === 0 ?
        { intersect: function () { return true; } } :
        Insection.interval.apply(null, intervalArgs);

    var root = this.data.root;
    var queue = [];
    if (root) {
        queue.push(root);
    }

    while (queue.length) {
        var node = queue.pop();

        if (interval.intersect(node.value.interval)) {
            var result = callback.call(null, node.value);
            if (typeof result !== 'undefined') {
                return result;
            }
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
};

Insection.prototype.getEntries = function () {
    var result = [];
    var args = Array.prototype.slice.call(arguments);
    args.push(function (value) {
        result.push(value);
    });
    this.forEachEntry.apply(this, args);
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

function pointsOrder(a, b) {
    if (a.point < b.point) { return -1; }
    if (a.point > b.point) { return 1; }
    if (a.isStart && b.isEnd) { return -1; }
    if (a.isEnd && b.isStart) { return 1; }
    if (a.isStart) {
        if (a.isOpen && !b.isOpen) { return 1; }
        if (!a.isOpen && b.isOpen) { return -1; }
    } else {
        if (a.isOpen && !b.isOpen) { return -1; }
        if (!a.isOpen && b.isOpen) { return 1; }
    }

    return 0;
}

function unique(points) {
    return points.reduce(function (result, point) {
        if (result.length === 0 || pointsOrder(result[result.length - 1], point) !== 0) {
            result.push(point);
        }
        return result;
    }, []);
}

Insection.prototype.getIntersection = function () {
    if (arguments.length === 0) {
        return this.getIntervals();
    }

    var queryInterval = Insection.interval.apply(null, arguments);
    return this.getIntervals(queryInterval).map(function (interval) {
        return queryInterval.getIntersection(interval);
    });
};

function isInfinite(value) {
    return value === Infinity || value === -Infinity;
}

Insection.prototype.getGaps = function () {
    var queryInterval = Insection.interval.apply(null, arguments);
    var intervals = new Insection();

    var points = [
        {
            point: queryInterval.start,
            isStart: true,
            isOpen: queryInterval.isStartOpen()
        },
        {
            point: queryInterval.end,
            isEnd: true,
            isOpen: queryInterval.isEndOpen()
        }
    ];

    this.getIntersection(queryInterval).forEach(function (interval) {
        points.push({
            point: interval.start,
            isEnd: true,
            isOpen: !interval.isStartOpen()
        });
        points.push({
            point: interval.end,
            isStart: true,
            isOpen: !interval.isEndOpen()
        });
        intervals.add(interval, interval);
    });

    points = unique(points.sort(pointsOrder));

    points = points.filter(function (point) {
        if (point.point === -Infinity || point.point === Infinity) {
            return true;
        }

        var expectedNumberOfIntervals = point.isOpen ? 1 : 0;
        var i = 0;
        var foundMoreThanExpectedIntersections = intervals.forEachEntry(point.point, function (entry) {
            if (expectedNumberOfIntervals === i) {
                return true;
            }
            i += 1;
        });

        return !foundMoreThanExpectedIntersections;
    });

    var lastStart;
    var result = [];
    points.forEach(function (endPoint) {
        if (endPoint.isStart) {
            lastStart = endPoint;
        } else if (lastStart) {
            if (
                lastStart.point !== endPoint.point ||
                (!isInfinite(lastStart.point) &&
                    (!lastStart.isOpen || !endPoint.isOpen))
            ) {
                result.push(Insection.interval(
                    lastStart.isOpen ? '(' : '[',
                    lastStart.point,
                    endPoint.point,
                    endPoint.isOpen ? ')' : ']'
                ));
            }
            lastStart = null;
        }
    });

    return result;
};


module.exports = Insection;
