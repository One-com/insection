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
