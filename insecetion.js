!function(e){if("object"==typeof exports&&"undefined"!=typeof module)module.exports=e();else if("function"==typeof define&&define.amd)define([],e);else{var o;"undefined"!=typeof window?o=window:"undefined"!=typeof global?o=global:"undefined"!=typeof self&&(o=self);var n=o;n=n.com||(n.com={}),n=n.one||(n.one={}),n.insection=e()}}(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var InvalidIntervalError = require(3);
var Interval = require(2);
var RedBlackTree = require(4);

function augmenter(value, x, y) {
    var interval = value.interval;
    if (!x && !y) return interval;

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
    if (x < y) return -1;
    if (x > y) return 1;
    return 0;
}

function intervalComparer(x, y) {
    if (x.start < y.start) return -1;
    if (x.start > y.start) return 1;
    if (x.end < y.end) return -1;
    if (x.end > y.end) return 1;
    if (!x.isStartOpen() && y.isStartOpen()) return -1;
    if (x.isStartOpen() && !y.isStartOpen()) return 1;
    if (!x.isEndOpen() && y.isEndOpen()) return -1;
    if (x.isEndOpen() && !y.isEndOpen()) return 1;
    return 0;
}

function Insection(valueComparer) {
    if (!(this instanceof Insection)) {
        return new Insection();
    }
    valueComparer = valueComparer || defaultValueComparer;

    this.data = new RedBlackTree(function (x, y) {
        var c = intervalComparer(x.interval, y.interval);
        if (c !== 0) return c;
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
    var interval = Insection.interval.apply(null, arguments);

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

},{}],2:[function(require,module,exports){
var InvalidIntervalError = require(3);

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
        if (isInfinite(start) || isInfinite(end)) throw new InvalidIntervalError(arguments);
        return new ClosedClosedInterval(start, end);
    case '[)':
        if (isInfinite(start)) throw new InvalidIntervalError(arguments);
        return new ClosedOpenInterval(start, end);
    case '(]':
        if (isInfinite(end)) throw new InvalidIntervalError(arguments);
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
    var x = this;
    var y = other;
    return !(
        // y starts after x ends
        x.end < y.start ||
            // x starts after y ends
            x.start > y.end ||
            // x and y share start and end but one of the interval ends are open
            (x.end === y.start && (x.isEndOpen() || y.isStartOpen())) ||
            (x.start === y.end && (x.isStartOpen() || y.isEndOpen()))
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
function InvalidIntervalError(args) {
    var argsString = Array.prototype.join.call(args, ', ');
    this.name = InvalidIntervalError;
    this.message =
        'Insection.interval was called with ' + argsString + ' valid signatures are:\n' +
        'Insection.interval(start,end)\n' +
        'Insection.interval("[",start,end,"]")\n' +
        'Insection.interval("[",start,end,")")\n' +
        'Insection.interval("(",start,end,"]")\n' +
        'Insection.interval("(",start,end,")")\n' +
        'where start <= end.';
    Error.call(this, this.message);
}
InvalidIntervalError.prototype = Object.create(Error.prototype);

module.exports = InvalidIntervalError;

},{}],4:[function(require,module,exports){
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