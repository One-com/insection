Retrieves intervals for all gaps in the insection within a given interval.

Signature:

```js#evaluate:false
insection.getGaps(p) => insection.getGaps('[', p, p, ']');
insection.getGaps(start, end) => insection.getGaps('[', start, end, ']');
insection.getGaps('[', start, end, ']') =>
  insection.getGaps(Insection.interval('[', start, end, ']'));
insection.getGaps('[', start, end, ')') =>
  insection.getGaps(Insection.interval('[', start, end, ')'));
insection.getGaps('(', start, end, ']') =>
  insection.getGaps(Insection.interval('(', start, end, ']'));
insection.getGaps('(', start, end, ')') =>
  insection.getGaps(Insection.interval('(', start, end, ')'));
insection.getGaps(interval);
```

Time complexity: `O(log(n)*m)` where `n` is the number of intervals in
the data structure and `m` is the number of found intervals.

Example:

```js
var insection = new Insection();
insection.add(0, 2, '0');
insection.add(3, 6, '1');
insection.add('[', 5, 7, ')', '2');
insection.add('(', 7, 8, ']', '3');
insection.add(9, 10, '4');
expect(insection.getGaps(0, 10).map(function (interval) {
    return interval.toString();
}).sort(), 'to equal', [ '(2;3)', '(8;9)', '[7;7]' ]);
```
