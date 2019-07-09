const axios = require('axios');
const path = require('path');
const fs = require('fs');
const conf = require('conf');
const files = conf.get('files');

const save = exports.save = function save(url) {
	return new Promise(async resolve => {
		const filePath = path.join( files.path, path.basename(url) );
		const stream = fs.createWriteStream(filePath);
		const { data } = await axios.get(url, {
			responseType: 'stream'
		});

		data
			.pipe(stream)
			.on('close', () => {
				resolve(filePath);
			});
	});
};