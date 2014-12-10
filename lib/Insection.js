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
    function Insection() {
        if (!(this instanceof Insection)) {
            return new Insection();
        }
    }

    Insection.prototype.isEmpty = function () {
        return true;
    };

    return Insection;
}));
