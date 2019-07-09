const nconf = require('nconf');
const path = require('path');

module.exports = nconf.argv()
	.env()
	.file({ file: path.join(__dirname, './index.json') });