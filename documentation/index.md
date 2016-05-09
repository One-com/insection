---
template: default.ejs
theme: dark
title: Insection
repository: https://github.com/One-com/insection
---

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

## Usage

```js
var insection = new Insection();
insection.add(0, 4, 'foo');
insection.add('(', 2, 6, ']', 'bar');
expect(insection.get(1, 5).sort(), 'to equal', ['bar', 'foo']);
expect(insection.get(0, 2).sort(), 'to equal', ['foo']);
insection.add('[', 2, Infinity, ')', 'baz');
expect(insection.get('(', -Infinity, 2, ')').sort(), 'to equal', ['foo']);
expect(insection.get(2).sort(), 'to equal', ['baz', 'foo']);
```

## Installation

### Node

Install it with NPM or add it to your `package.json`:

```
$ npm install insection
```

Then:

```js#evaluate:false
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

```js#evaluate:false
var insection = new com.one.Insection();
insection.add(0, 4, 'foo');
insection.add(2, 6, 'bar');
expect(insection.get(1, 5).sort(), 'to equal', ['foo', 'bar']);
```

### RequireJS

Include the library with RequireJS the following way:

```js#evaluate:false
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
