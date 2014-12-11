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

    function throwInvalidInterval() {
        var args = Array.prototype.join.call(arguments, ', ');
        throw new Error('Insection.interval was called with ' + args + ' valid signatures are:\n' +
                        'Insection.interval(start,end)\n' +
                        'Insection.interval("[",start,end,"]")\n' +
                        'Insection.interval("[",start,end,")")\n' +
                        'Insection.interval("(",start,end,"]")\n' +
                        'Insection.interval("(",start,end,")")\n' +
                        'where start <= end.');
    }

    Insection.interval = function (startType, start, end, endType) {
        if (arguments.length === 1) {
            if (!(arguments[0] instanceof Interval)) {
                throwInvalidInterval.apply(null, arguments);
            }

            return arguments[0];
        }

        if (arguments.length === 2) {
            return Insection.interval('[', arguments[0], arguments[1], ']');
        }

        if (
            arguments.length !== 4 ||
            typeof start !== typeof end ||
            start > end
        ) {
            throwInvalidInterval(null, arguments);
        }

        switch (startType + endType) {
            case '[]': return new ClosedClosedInterval(start, end);
            case '[)': return new ClosedOpenInterval(start, end);
            case '(]': return new OpenClosedInterval(start, end);
            case '()': return new OpenOpenInterval(start, end);
            default: throwInvalidInterval(null, arguments);
        }
    };

    Insection.prototype.isEmpty = function () {
        return this.data.length === 0;
    };

    Insection.prototype.add = function () {
        var data = this.data;
        var intervalArgs = Array.prototype.slice.call(arguments, 0, -1);
        var interval = Insection.interval.apply(null, intervalArgs);
        var value = arguments[arguments.length - 1];

        data.push({ interval: interval, value: value });
        return this;
    };

    Insection.prototype.contains = function () {
        var interval = Insection.interval.apply(null, arguments);
        return this.data.some(function (entry) {
            return interval.equal(entry.interval);
        });
    };

    return Insection;
}));
