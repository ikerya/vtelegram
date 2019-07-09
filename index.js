const conf = require('conf');
const app = require('express')();

require('lib/vtelegram')(app, conf.get('options'));

app.listen(conf.get('port'));