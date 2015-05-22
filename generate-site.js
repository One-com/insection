var argv = require('minimist')(process.argv.slice(2));

Insection = require('./lib/Insection');
var unexpected = require('unexpected');
var generator = require('unexpected-documentation-site-generator');
argv.unexpected = unexpected;
generator(argv);
