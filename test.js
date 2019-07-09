const bot = new (require('bot-tg'))({
	token: '814979496:AAFQyCVEGPYTxxGezKrHRKr37tGAjFSkyac',
	logging: true
});

const fid = 'AgADAgAD4KoxG5pzyEjkwi7LWi5-D8c8hA8ABL1aovZ9fs1ezpYCAAEC';

//bot.sendMessage(385157028, 'test');

				bot.post('sendPhoto', {
					chat_id: 385157028,
					photo: fid
				})
				.then(console.log)