Retrieves the interval and value for the intervals that intersect the given interval.

Signature:

```js#evaluate:false
insection.getEntries() => insection.getEntries('(', min, max, ')');
insection.getEntries(p) => insection.getEntries('[', p, p, ']');
insection.getEntries(start, end) => insection.getEntries('[', start, end, ']');
insection.getEntries('[', start, end, ']') =>
  insection.getEntries(Insection.interval('[', start, end, ']'));
insection.getEntries('[', start, end, ')') =>
  insection.getEntries(Insection.interval('[', start, end, ')'));
insection.getEntries('(', start, end, ']') =>
  insection.getEntries(Insection.interval('(', start, end, ']'));
insection.getEntries('(', start, end, ')') =>
  insection.getEntries(Insection.interval('(', start, end, ')'));
insection.getEntries(interval);
```

Time complexity: `O(log(n*m))` where `n` is the number of intervals in
the data structure and `m` is the number of found intervals.

Example:

```js
var insection = new Insection();
insection.add(0, 4, 'foo');
insection.add('(', 2, 6, ']', 'bar');
expect(insection.getEntries(1, 5).map(function (entry) {
    return entry.interval + ' => ' + entry.value;
}).sort(), 'to equal', ['(2;6] => bar', '[0;4] => foo']);
expect(insection.getEntries().map(function (entry) {
    return entry.interval + ' => ' + entry.value;
}).sort(), 'to equal', ['(2;6] => bar', '[0;4] => foo']);
```
