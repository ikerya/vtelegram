const qs = require('qs');
const redis = require('redis');
const pub = redis.createClient();

const event = exports.event = function event(req, res) {
	const body = [];

	req.on('data', chunk =>
		body.push( chunk )
	);
	req.on('end', () => {
		const data = qs.parse( body.toString() );

		pub.publish('vk:event', JSON.stringify(data));
		res.end('ok');
	});
};