module.exports = app => {
	app.post('/vk/event', require('middleware/vk').event);
};