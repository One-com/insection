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
