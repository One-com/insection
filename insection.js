/*!
 * Copyright (C) 2014 one.com
 * 
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 * 
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 * 
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE. */
!function(e){if("object"==typeof exports&&"undefined"!=typeof module)module.exports=e();else if("function"==typeof define&&define.amd)define([],e);else{var o;"undefined"!=typeof window?o=window:"undefined"!=typeof global?o=global:"undefined"!=typeof self&&(o=self);var n=o;n=n.com||(n.com={}),n=n.one||(n.one={}),n.insection=e()}}(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var InvalidIntervalError = require(3);
var Interval = require(2);
var RedBlackTree = require(4);

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

},{}],2:[function(require,module,exports){
var InvalidIntervalError = require(3);

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

},{}],3:[function(require,module,exports){
function InvalidIntervalError(startString, start, end, endString) {
    var argsString = [startString, start, end, endString].join(', ');
    var error = Error.call(this, 'Insection.interval was called with ' + argsString + ' valid signatures are:\n' +
                           'Insection.interval(start,end)\n' +
                           'Insection.interval("[",start,end,"]")\n' +
                           'Insection.interval("[",start,end,")")\n' +
                           'Insection.interval("(",start,end,"]")\n' +
                           'Insection.interval("(",start,end,")")\n' +
                           'where start <= end.');
    this.name = 'InvalidIntervalError';
    this.message = error.message;
    this.stack = error.stack;
}
InvalidIntervalError.prototype = Object.create(Error.prototype);

module.exports = InvalidIntervalError;

},{}],4:[function(require,module,exports){
// Argumented red black tree base on
// https://github.com/scttnlsn/redblack.js

function nodeColor(node) {
    return node === null ? BLACK : node.color;
}

var BLACK = 'black';
var RED = 'red';

function Node(value) {
    this.value = value;
    this.color = RED;
    this.left = null;
    this.right = null;
    this.parent = null;
}

Node.prototype.grandparent = function () {
    if (this.parent === null) { return null; }
    return this.parent.parent;
};

Node.prototype.sibling = function () {
    if (this.parent === null) { return null; }
    return this === this.parent.left ? this.parent.right : this.parent.left;
};

Node.prototype.uncle = function () {
    if (this.parent === null) { return null; }
    return this.parent.sibling();
};

function RedBlackTree(comparefn, augmenterfn) {
    this.root = null;
    this.comparefn = comparefn;
    this.augmenterfn = augmenterfn;
    this.balancer = new Balancer(this);
}

RedBlackTree.prototype.augmentNode = function (node) {
    node.hierarchicalData = this.augmenterfn(
        node.value,
        node.left && node.left.hierarchicalData,
        node.right && node.right.hierarchicalData
    );
};

RedBlackTree.prototype.augmentAncestors = function (node) {
    node = node && node.parent;

    while (node) {
        this.augmentNode(node);
        node = node.parent;
    }
};

RedBlackTree.prototype.augmentNodeAndAncestors = function (node) {
    if (node) {
        this.augmentNode(node);
        this.augmentAncestors(node);
    }
};

RedBlackTree.prototype.isEmpty = function () {
    return this.root === null;
};

RedBlackTree.prototype.add = function (value) {
    var newNode = new Node(value);

    if (this.isEmpty()) {
        this.root = newNode;
    } else {
        var node = this.root;

        while (true) {
            var c = this.comparefn(value, node.value);
            if (c < 0) {
                if (node.left === null) {
                    node.left = newNode;
                    break;
                } else {
                    node = node.left;
                }
            } else if (0 < c) {
                if (node.right === null) {
                    node.right = newNode;
                    break;
                } else {
                    node = node.right;
                }
            } else {
                node.value = value;
                return;
            }
        }

        newNode.parent = node;
    }
    this.augmentNodeAndAncestors(newNode);
    this.balancer.inserted(newNode);
};

RedBlackTree.prototype.findNode = function (navigator) {
    var node = this.root;
    while (node !== null) {
        var c = navigator(node);
        if (c < 0) {
            node = node.left;
        } else if (0 < c) {
            node = node.right;
        } else {
            return node;
        }
    }
    return null;
};

RedBlackTree.prototype.find = function (navigator) {
    var node = this.findNode(function (node) {
        return navigator(node.value);
    });
    return node && node.value;
};

RedBlackTree.prototype.remove = function (value) {
    var comparefn = this.comparefn;
    var node = this.findNode(function (node) {
        return comparefn(value, node.value);
    });

    if (node === null) { return; }

    if (node.left !== null && node.right !== null) {
        var pred = node.left;
        while (pred.right !== null) {
            pred = pred.right;
        }
        node.value = pred.value;
        node = pred;
    }

    this.augmentNodeAndAncestors(node);

    var child = (node.right === null) ? node.left : node.right;
    if (nodeColor(node) === BLACK) {
        node.color = nodeColor(child);
        this.balancer.deleted(node);
    }

    this.balancer.replaceNode(node, child);
    this.augmentNodeAndAncestors(child);

    if (nodeColor(this.root) === RED) {
        this.root.color = BLACK;
    }
};

function Balancer(tree) {
    this.tree = tree;
}

Balancer.prototype.inserted = function (node) {
    this.insertCase1(node);
};

Balancer.prototype.deleted = function (node) {
    this.deleteCase1(node);
};

Balancer.prototype.replaceNode = function (original, replacement) {
    if (original.parent === null) {
        this.tree.root = replacement;
    } else {
        if (original === original.parent.left) {
            original.parent.left = replacement;
        } else {
            original.parent.right = replacement;
        }
    }

    if (replacement !== null) {
        replacement.parent = original.parent;
    }
};

Balancer.prototype.rotateLeft = function (node) {
    var right = node.right;
    this.replaceNode(node, right);

    // Update pointers
    node.right = right.left;
    if (right.left !== null) { right.left.parent = node; }
    right.left = node;
    node.parent = right;
    this.tree.augmentNodeAndAncestors(node);
};

Balancer.prototype.rotateRight = function (node) {
    var left = node.left;
    this.replaceNode(node, left);

    // Update pointers
    node.left = left.right;
    if (left.right !== null) { left.right.parent = node; }
    left.right = node;
    node.parent = left;
    this.tree.augmentNodeAndAncestors(node);
};

Balancer.prototype.insertCase1 = function (node) {
    if (node.parent === null) {
        node.color = BLACK;
    } else {
        this.insertCase2(node);
    }
};

Balancer.prototype.insertCase2 = function (node) {
    if (nodeColor(node.parent) === BLACK) {
        return;
    } else {
        this.insertCase3(node);
    }
};

Balancer.prototype.insertCase3 = function (node) {
    var uncle = node.uncle();
    var grandparent = node.grandparent();

    if (uncle !== null && nodeColor(uncle) === RED) {
        node.parent.color = BLACK;
        uncle.color = BLACK;
        grandparent.color = RED;
        this.insertCase1(grandparent);
    } else {
        this.insertCase4(node);
    }
};

Balancer.prototype.insertCase4 = function (node) {
    var grandparent = node.grandparent();

    if (node === node.parent.right && node.parent === grandparent.left) {
        this.rotateLeft(node.parent);
        node = node.left;
    } else if (node === node.parent.left && node.parent === grandparent.right) {
        this.rotateRight(node.parent);
        node = node.right;
    }

    this.insertCase5(node);
};

Balancer.prototype.insertCase5 = function (node) {
    var grandparent = node.grandparent();

    node.parent.color = BLACK;
    grandparent.color = RED;

    if (node === node.parent.left && node.parent === grandparent.left) {
        this.rotateRight(grandparent);
    } else if (node === node.parent.right && node.parent === grandparent.right) {
        this.rotateLeft(grandparent);
    }
};

Balancer.prototype.deleteCase1 = function (node) {
    if (node.parent !== null) { this.deleteCase2(node); }
};

Balancer.prototype.deleteCase2 = function (node) {
    var sibling = node.sibling();

    if (nodeColor(sibling) === RED) {
        node.parent.color = RED;
        sibling.color = BLACK;
        if (node === node.parent.left) {
            this.rotateLeft(node.parent);
        } else {
            this.rotateRight(node.parent);
        }
    }

    this.deleteCase3(node);
};

Balancer.prototype.deleteCase3 = function (node) {
    var sibling = node.sibling();

    if (nodeColor(node.parent) === BLACK &&
        nodeColor(sibling) === BLACK &&
        nodeColor(sibling.left) === BLACK &&
        nodeColor(sibling.right) === BLACK) {

        sibling.color = RED;
        this.deleteCase1(node.parent);
    } else {
        this.deleteCase4(node);
    }
};

Balancer.prototype.deleteCase4 = function (node) {
    var sibling = node.sibling();

    if (nodeColor(node.parent) === RED &&
        nodeColor(sibling) === BLACK &&
        nodeColor(sibling.left) === BLACK &&
        nodeColor(sibling.right) === BLACK) {

        sibling.color = RED;
        node.parent.color = BLACK;
    } else {
        this.deleteCase5(node);
    }
};

Balancer.prototype.deleteCase5 = function (node) {
    var sibling = node.sibling();

    if (node === node.parent.left &&
        nodeColor(sibling) === BLACK &&
        nodeColor(sibling.left) === RED &&
        nodeColor(sibling.right) === BLACK) {

        sibling.color = RED;
        sibling.left.color = BLACK;
        this.rotateRight(sibling);
    } else if (node === node.parent.right &&
               nodeColor(sibling) === BLACK &&
               nodeColor(sibling.right) === RED &&
               nodeColor(sibling.left) === BLACK) {

        sibling.color = RED;
        sibling.right.color = BLACK;
        this.rotateLeft(sibling);
    }

    this.deleteCase6(node);
};

Balancer.prototype.deleteCase6 = function (node) {
    var sibling = node.sibling();

    sibling.color = nodeColor(node.parent);
    node.parent.color = BLACK;

    if (node === node.parent.left) {
        sibling.right.color = BLACK;
        this.rotateLeft(node.parent);
    } else {
        sibling.left.color = BLACK;
        this.rotateRight(node.parent);
    }
};

module.exports = RedBlackTree;

},{}]},{},[1])(1)
});