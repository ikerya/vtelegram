const conf = require('conf');
const TelegramBot = require('bot-tg');
const vk = require('lib/vk');

const fs = require('fs');
const { promisify } = require('util');
const axios = require('axios');
const FormData = require('form-data');

axios.defaults.timeout = 5000;
FormData.prototype.submit = promisify(FormData.prototype.submit);

class Telegram {
	constructor(options) {
		this.options = options;
		this.registered = [];

		this.init();
	}

	transform(fn) {
		const self = this;

		return function(...args) {
			return fn.bind(this, self, ...args)();
		};
	}

	init() {
		const { options } = this;

		this.bot = new TelegramBot({
			token: options.token,
			commands: [{
				id: 'register',
				title: 'Введите пароль:',
				description: 'Регистрация',
				done: this.transform( this.register )
			}]
		});
	}

	register(self, userId, password) {
		const { options, bot, registered } = self;

		if (registered.includes(userId)) {
			return bot.sendMessage(userId, 'Ты уже зарегистрировался.');
		}

		if (options.password !== password) {
			return bot.sendMessage(userId, 'Неверный пароль.');
		}

		self.registered.push(userId);
		bot.sendMessage(userId, 'Вы успешно авторизованы.');
	}

	async emit(event, data) {
		switch (event) {
			case 'message_new':
				const { user_id, body } = data;
				const result = await vk.call('users.get', {
					user_id
				});
				const response = result.response[0];
				const attachments = data.attachments ? 
					await vk.saveAttachments(data.attachments):
					{
						list: []
					};
				const files = await this.uploadFiles(attachments);
				const tpl = `${response.first_name} ${response.last_name}: {item}`;

				this.emitRegistered({
					tpl,
					body
				}, files);

				break;
		}
	}

	emitRegistered({ tpl, body }, { list }) {
		const { bot } = this;
		const item = body ? 
			body: 
			'прикрепил(а) вложения'
		const text = tpl.replace('{item}', item);

		this.registered.map(async id => {
			await bot.sendMessage(id, text);

			if (!list.length) {
				return;
			}

			list.map(this.sendFile.bind(this, id));
		});
	}

	async uploadFiles({ list }) {
		const { bot, registered } = this;
		const result = {
			list: []
		};

		for (let i = 0; i < list.length; i++) {
			const { type, path } = list[i];

			switch (type) {
				case 'photo':
					result.list.push({
						type,
						file_id: await this.uploadPhoto(path)
					});

					break;
			}
		}

		return result;
	}

	uploadPhoto(path) {
		return new Promise(async resolve => {
			const { bot, options } = this;

			bot.sendPhoto(options.tester_id, path, '')
				.then(req => {
					const body = [];

					req.on('data', chunk => 
						body.push(chunk)
					);
					req.on('end', () => {
						const response = JSON.parse(body.join('').toString());
						const photo = response.result.photo;
						const lastPhoto = photo[photo.length - 1];

						resolve(lastPhoto.file_id);
					});
				});
		});
	}

	sendFile(userId, { type, file_id }) {
		switch (type) {
			case 'photo':
				return this.sendPhoto(userId, file_id);
		}
	}

	sendPhoto(userId, fileId) {
		const { bot } = this;

		return bot.post('sendPhoto', {
			chat_id: userId,
			photo: fileId
		});		
	}
}

module.exports = new Telegram(conf.get('telegram'));