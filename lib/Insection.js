(function (root, factory) {
    if (typeof exports === 'object') {
        module.exports = factory();
    } else if (typeof define === 'function' && define.amd) {
        define(factory);
    } else {
        root.com = root.com || {};
        root.com.one = root.com.one || {};
        root.com.one.insection = factory();
    }
}(this, function () {
    function extend(target) {
        var sources = Array.prototype.slice.call(arguments, 1);
        sources.forEach(function (source) {
            Object.keys(source).forEach(function (key) {
                target[key] = source[key];
            });
        });
        return target;
    }

    function Interval(start, end) {
        this.start = start;
        this.end = end;
    }

    Interval.prototype.toString = function (detailed) {
        return detailed ? "Insection.interval('" + this.startString + "'," + this.start + "," + this.end + ",'" + this.endString + "')" :
            this.startString + this.start + "," + this.end + this.endString;
    };

    Interval.prototype.equal = function (other) {
        return this.constructor === other.constructor &&
            this.start === other.start && this.end === other.end;
    };

    function OpenOpenInterval(start, end) {
        Interval.call(this, start, end);
        this.startString = '(';
        this.endString = ')';
    }
    OpenOpenInterval.prototype = Object.create(Interval.prototype);

    function OpenClosedInterval(start, end) {
        Interval.call(this, start, end);
        this.startString = '(';
        this.endString = ']';
    }
    OpenClosedInterval.prototype = Object.create(Interval.prototype);

    function ClosedOpenInterval(start, end) {
        Interval.call(this, start, end);
        this.startString = '[';
        this.endString = ')';
    }
    ClosedOpenInterval.prototype = Object.create(Interval.prototype);

    function ClosedClosedInterval(start, end) {
        Interval.call(this, start, end);
        this.startString = '[';
        this.endString = ']';
    }
    ClosedClosedInterval.prototype = Object.create(Interval.prototype);

    function Insection() {
        if (!(this instanceof Insection)) {
            return new Insection();
        }

        this.data = [];
    }

    function throwInvalidIntervalSignature() {
        var args = Array.prototype.join.call(arguments, ', ');
        throw new Error('Insection.interval was called with ' + args + ' valid signatures are:\n' +
                        'Insection.interval(a,b)\n' +
                        'Insection.interval("[",a,b,"]")\n' +
                        'Insection.interval("[",a,b,")")\n' +
                        'Insection.interval("(",a,b,"]")\n' +
                        'Insection.interval("(",a,b,")")');
    }

    Insection.interval = function (startType, start, end, endType) {
        if (arguments.length === 1) {
            if (!(arguments[0] instanceof Interval)) {
                throwInvalidIntervalSignature.apply(null, arguments);
            }

            return arguments[0];
        }

        if (arguments.length === 2) {
            return Insection.interval('[', arguments[0], arguments[1], ']');
        }

        if (arguments.length !== 4) {
            throwInvalidIntervalSignature(null, arguments);
        }

        switch (startType + endType) {
            case '[]': return new ClosedClosedInterval(start, end);
            case '[)': return new ClosedOpenInterval(start, end);
            case '(]': return new OpenClosedInterval(start, end);
            case '()': return new OpenOpenInterval(start, end);
            default: throw new Error('Unknown interval combination: ' + startType + endType);
        }
    };

    Insection.prototype.isEmpty = function () {
        return this.data.length === 0;
    };

    function comparefn(a, b) {
        if (a.end < b.end) return -1;
        if (a.end > b.end) return 1;
        if (a.start < b.start) return -1;
        if (a.start > b.start) return 1;
        return 0;
    }

    function search(data, interval) {
        var left = -1;
        var right = data.length;
        var mid;
        while (right - left > 1) {
            mid = (left + right) >>> 1;
            if (comparefn(data[mid].interval, interval) < 0) {
                left = mid;
            } else {
                right = mid;
            }
        }
        return right;
    }

    Insection.prototype.add = function () {
        var data = this.data;
        var intervalArgs = Array.prototype.slice.call(arguments, 0, -1);
        var interval = Insection.interval.apply(null, intervalArgs);
        var value = arguments[arguments.length - 1];

        var index = search(data, interval);
        data.splice(index, 0, { interval: interval, value: value });
        return this;
    };

    Insection.prototype.contains = function () {
        var interval = Insection.interval.apply(null, arguments);
        var index = search(this.data, interval);
        return 0 <= index && index < this.data.length;
    };

    return Insection;
}));
