const redis = require('redis');
const telegram = require('lib/telegram');

class Vtelegram {
	constructor(app, options) {
		this.app = app;
		this.options = options;

		this.init();
		this.createClient();
	}

	init() {
		const { app } = this;

		require('routes')(app);
	}

	createClient() {
		this.client = redis.createClient();
		this.listen();
	}

	listen() {
		const { client, bot } = this;

		client.psubscribe('vk:*');
		client.on('pmessage', (pattern, event, data) => {
			data = JSON.parse(data);

			switch (event) {
				case 'vk:event':
					const { type, object } = data;

					telegram.emit(type, object);

					break;
			}
		});
	}
}

module.exports = (...args) =>
	new Vtelegram(...args);