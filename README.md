# Insection

A data structure that allows efficiently to find all intervals that
overlap with any given interval or point.

The data structure is a red black tree augmented with hieracical data
based on [redblack.js](https://github.com/scttnlsn/redblack.js).

[![npm version](https://badge.fury.io/js/insection.svg)](http://badge.fury.io/js/insection)
[![Build Status](https://travis-ci.org/One-com/insection.svg)](https://travis-ci.org/One-com/insection)
[![Coverage Status](https://coveralls.io/repos/One-com/insection/badge.svg)](https://coveralls.io/r/One-com/insection)
[![Dependency Status](https://david-dm.org/One-com/insection.svg)](https://david-dm.org/One-com/insection)
[![devDependency Status](https://david-dm.org/One-com/insection/dev-status.svg)](https://david-dm.org/One-com/insection#info=devDependencies)

## Installation

### Node

Install it with NPM or add it to your `package.json`:

```
$ npm install insection
```

Then:

```js
var Insection = require('insection');
var insection = new Insection();
insection.add(0, 4, 'foo');
insection.add(2, 6, 'bar');
expect(insection.get(1, 5).sort(), 'to equal', ['foo', 'bar']);
```

### Browser

Include `insection.js`.

```html
<script src="insection.js"></script>
```

this will expose the `Insection` function under the following namespace:

```js
var insection = new com.one.Insection();
insection.add(0, 4, 'foo');
insection.add(2, 6, 'bar');
expect(insection.get(1, 5).sort(), 'to equal', ['foo', 'bar']);
```

### RequireJS

Include the library with RequireJS the following way:

```js
require.config({
    paths: {
        Insection: 'path/to/insection'
    }
});

define(['Insection'], function (Insection) {
    var insection = new Insection();
    insection.add(0, 4, 'foo');
    insection.add(2, 6, 'bar');
    expect(insection.get(1, 5).sort(), 'to equal', ['foo', 'bar']);
});
```

## Usage

```js
var Insection = require('insection');
var insection = new Insection();
insection.add(0, 4, 'foo');
insection.add('(', 2, 6, ']', 'bar');
expect(insection.get(1, 5).sort(), 'to equal', ['foo', 'bar']);
expect(insection.get(0, 2).sort(), 'to equal', ['foo']);
insection.add('[', 2, Infinity, ')', 'baz');
expect(insection.get('(', -Infinity, 2, ')').sort(), 'to equal', ['foo']);
expect(insection.get(2).sort(), 'to equal', ['foo', 'baz']);
```

## API

### constructor

Creates a new insection instance.

Signature:

```js
new Insection(); => new Insection(defaultValueComparer);
new Insection(valueComparer);
```

where `defaultValueComparer` is:

```js
function defaultValueComparer(x, y) {
    if (x < y) { return -1; }
    if (x > y) { return 1; }
    return 0;
}
```

Values is required to have a total order, if you values does not
support the comparison operators you can specify a valueComparer.

### add

Associate the given value with the specified interval.

Signature:

```js
insection.add(p, value) => insection.add('[', p, p, ']', value);
insection.add(start, end, value) => insection.add('[', start, end, ']', value);
insection.add('[', start, end, ']', value) =>
  insection.add(Insection.interval('[', start, end, ']'), value);
insection.add('[', start, end, ')', value) =>
  insection.add(Insection.interval('[', start, end, ')'), value);
insection.add('(', start, end, ']', value) =>
  insection.add(Insection.interval('(', start, end, ']'), value);
insection.add('(', start, end, ')', value) =>
  insection.add(Insection.interval('(', start, end, ')'), value);
insection.add(interval, value);
```

Time complexity: `O(log(n))` where `n` is the number of intervals in the
data structure.

Example:

```js
insection.add('(', 4, 7, ']', 'foo');
expect(insection.contains('(', 4, 7, ']'), 'to be true');
```

### get

Retrieves the values for all intervals that intersect the given interval.

Signature:

```js
insection.get() => insection.get('(', min, max, ')');
insection.get(p) => insection.get('[', p, p, ']');
insection.get(start, end) => insection.get('[', start, end, ']');
insection.get('[', start, end, ']') => insection.get(Insection.interval('[', start, end, ']'));
insection.get('[', start, end, ')') => insection.get(Insection.interval('[', start, end, ')'));
insection.get('(', start, end, ']') => insection.get(Insection.interval('(', start, end, ']'));
insection.get('(', start, end, ')') => insection.get(Insection.interval('(', start, end, ')'));
insection.get(interval);
```

Time complexity: `O(log(n)*m)` where `n` is the number of intervals in
the data structure and `m` is the number of found intervals.

Example:

```js
insection.add(0, 4, 'foo');
insection.add('(', 2, 6, ']', 'bar');
insection.add('[', 2, Infinity, ')', 'baz');
insection.add('[', 2, Infinity, ')', 'qux');
expect(insection.get(1, 5).sort(), 'to equal', ['foo', 'bar']);
expect(insection.get(0, 2).sort(), 'to equal', ['foo']);
expect(insection.get('(', -Infinity, 2, ')').sort(), 'to equal', ['foo']);
expect(insection.get(2).sort(), 'to equal', ['foo', 'baz', 'qux']);
expect(insection.get().sort(), 'to equal', ['foo', 'bar', 'baz', 'qux']);
```

### getIntervals

Retrieves the intervals that intersect the given interval.

Signature:

```js
insection.getIntervals() => insection.getIntervals('(', min, max, ')');
insection.getIntervals(p) => insection.getIntervals('[', p, p, ']');
insection.getIntervals(start, end) => insection.getIntervals('[', start, end, ']');
insection.getIntervals('[', start, end, ']') =>
  insection.getIntervals(Insection.interval('[', start, end, ']'));
insection.getIntervals('[', start, end, ')') =>
  insection.getIntervals(Insection.interval('[', start, end, ')'));
insection.getIntervals('(', start, end, ']') =>
  insection.getIntervals(Insection.interval('(', start, end, ']'));
insection.getIntervals('(', start, end, ')') =>
  insection.getIntervals(Insection.interval('(', start, end, ')'));
insection.getIntervals(interval);
```

Time complexity: `O(log(n)*m)` where `n` is the number of intervals in
the data structure and `m` is the number of found intervals.

Example:

```js
insection.add(0, 4, 'foo');
insection.add('(', 2, 6, ']', 'bar');
insection.add('[', 2, Infinity, ')', 'baz');
insection.add('[', 2, Infinity, ')', 'qux');
expect(insection.getIntervals(1, 5).map(String).sort(), 'to equal', ['(2;6]', '[0;4]']);
expect(insection.getIntervals(0, 2).map(String).sort(), 'to equal', ['[0;4]']);
expect(insection.getIntervals('(', -Infinity, 2, ')').map(String).sort(), 'to equal', ['[0;4]']);
expect(insection.getIntervals(2).map(String).sort(), 'to equal', [
  '[0;4]',
  '[2;Infinity)',
  '[2;Infinity)'
]);
expect(insection.getIntervals().map(String).sort(), 'to equal', [
  '(2;6]',
  '[0;4]',
  '[2;Infinity)',
  '[2;Infinity)'
]);
```

### getEntries

Retrieves the interval and value for the intervals that intersect the given interval.

Signature:

```js
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

Time complexity: `O(log(n)*m)` where `n` is the number of intervals in
the data structure and `m` is the number of found intervals.

Example:

```js
insection.add(0, 4, 'foo');
insection.add('(', 2, 6, ']', 'bar');
expect(insection.getIntervals(1, 5).map(function (entry) {
    return entry.interval + ' => ' + entry.value;
}).sort(), 'to equal', ['(2;6] => bar', '[0;4] => foo']);
expect(insection.getIntervals().map(function (entry) {
    return entry.interval + ' => ' + entry.value;
}).sort(), 'to equal', ['(2;6] => bar', '[0;4] => foo']);
```

### contains

Returns `true` if the insection contains the given interval; otherwise `false`.

Signature:

```js
insection.contains(p) => insection.contains('[', p, p, ']');
insection.contains(start, end) => insection.contains('[', start, end, ']');
insection.contains('[', start, end, ']') =>
  insection.contains(Insection.interval('[', start, end, ']'));
insection.contains('[', start, end, ')') =>
  insection.contains(Insection.interval('[', start, end, ')'));
insection.contains('(', start, end, ']') =>
  insection.contains(Insection.interval('(', start, end, ']'));
insection.contains('(', start, end, ')') =>
  insection.contains(Insection.interval('(', start, end, ')'));
insection.contains(interval);
```

Time complexity: `O(log(n))` where `n` is the number of intervals in the
data structure.

Example:

```js
insection.add(0, 4, 'foo');
insection.add('(', 2, 6, ']', 'bar');
expect(insection.contains(0, 4), 'to be true');
expect(insection.contains('(', 0, 4, ']'), 'to be true');
expect(insection.contains('[', 0, 4, ']'), 'to be false');
expect(insection.contains(0, 5), 'to be false');
```

### remove

Removes the association between the given value and the specified interval.

Signature:

```js
insection.remove(p, value) => insection.remove('[', p, p, ']', value);
insection.remove(start, end, value) => insection.remove('[', start, end, ']', value);
insection.remove('[', start, end, ']', value) =>
  insection.remove(Insection.interval('[', start, end, ']'), value);
insection.remove('[', start, end, ')', value) =>
  insection.remove(Insection.interval('[', start, end, ')'), value);
insection.remove('(', start, end, ']', value) =>
  insection.remove(Insection.interval('(', start, end, ']'), value);
insection.remove('(', start, end, ')', value) =>
  insection.remove(Insection.interval('(', start, end, ')'), value);
insection.remove(interval, value);
```

Time complexity: `O(log(n))` where `n` is the number of intervals in the
data structure.

Example:

```js
insection.add('(', 4, 7, ']', 'foo');
insection.add('[', 4, 7, ']', 'bar');
insection.remove('(', 4, 7, ']', 'foo');
expect(insection.contains('(', 4, 7, ']'), 'to be false');
expect(insection.contains('[', 4, 7, ']'), 'to be true');
```

### isEmpty

Returns `true` if the insection does not contain any intervals; otherwise `false`.

Time complexity: `O(1)`.

Example:

```js
expect(insection.isEmpty(), 'to be true');
insection.add('(', 4, 7, ']', 'foo');
expect(insection.isEmpty(), 'to be false');
```

### getGaps

Retrieves intervals for all gaps in the insection within a given interval.

Signature:

```js
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

### interval

Creates an interval for the given arguments.

Signature:

```js
Insection.interval(p) => Insection.interval('[', p, p, ']');
Insection.interval(start, end) => Insection.interval('[', start, end, ']');
Insection.interval(startType, start, end, endType);
```

`startType` can be either `[` or `(`.
`endType` can be either `]` or `)`.

Example:

```js
expect(Insection.interval(4).toString(), 'to be', '[4;4]');
expect(Insection.interval(4, 5).toString(), 'to be', '[4;5]');
expect(Insection.interval('[', 4, 5, ']').toString(), 'to be', '[4;5]');
expect(Insection.interval('[', 4, 5, ')').toString(), 'to be', '[4;5)');
expect(Insection.interval('(', 4, 5, ']').toString(), 'to be', '(4;5]');
expect(Insection.interval('(', 4, 5, ')').toString(), 'to be', '(4;5)');
```

## License

Copyright (C) 2014 one.com

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
