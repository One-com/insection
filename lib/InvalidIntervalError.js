function InvalidIntervalError(args) {
    var argsString = Array.prototype.join.call(args, ', ');
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
