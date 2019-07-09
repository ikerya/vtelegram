const axios = require('axios');
const qs = require('qs');
const conf = require('conf');
const files = require('lib/files');

class Vk {
	constructor(options) {
		this.options = options;
	}

	async call(method, data) {
		const { options } = this;

		data.v = (data.v ? +data.v: 5).toFixed(2);

		const methodUrl = `https://api.vk.com/method/${method}`;
		const apiRequest = await axios.post(methodUrl, qs.stringify({
			...options,
			...data
		}), {
			'Content-Type': 'application/x-www-form-urlencoded'
		});

		return apiRequest.data;
	}

	async saveAttachments(attachments) {
		const result = {
			list: []
		};

		for (let i = 0; i < attachments.length; i++) {
			const { type } = attachments[i];
			const attachment = attachments[i][type];

			switch (type) {
				case 'photo':
					const { photo_75, photo_130, photo_604 } = attachment;
					const photoUrl = photo_604 || photo_130 || photo_75;

					result.list.push({
						type,
						path: await files.save(photoUrl)
					});

					break;
			}
		}

		return result;
	}
}

module.exports = new Vk(conf.get('vk'));